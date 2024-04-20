import './wasm_exec.js';
async function getGQP() {
  const go = new Go();
  const result = await WebAssembly.instantiateStreaming(
    fetch(new URL('https://planetlabs.github.io/gpq/gpq.wasm', import.meta.url)),
    go.importObject,
  );
  go.run(result.instance);

  const exports = {};
  for (const name in Go.exports) {
    exports[name] = wrapFunction(Go.exports[name]);
  }
  return exports;
}

function unwrapReturn(data) {
  if (!data) {
    throw new Error('Unexpected response, see the console for more detail');
  }
  if (data.error) {
    throw new Error(data.error);
  }
  return data.value;
}

function wrapFunction(fn) {
  return function (...args) {
    return unwrapReturn(fn(...args));
  };
}

function getParquetData(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(new Uint8Array(reader.result));
    reader.onerror = () => reject(new Error(`failed to read ${file.name}`));
    reader.readAsArrayBuffer(file);
  });
}
function formatJSON(string) {
  return JSON.stringify(JSON.parse(string), null, 2);
}

function formatSize(bytes) {
  if (bytes === 0) {
    return 'empty';
  }
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.min(
    Math.floor(Math.log(bytes) / Math.log(1024)),
    sizes.length - 1,
  );
  if (i === 0) {
    return `${bytes} ${sizes[i]}`;
  }
  return `${(bytes / 1024 ** i).toFixed(1)} ${sizes[i]}`;
}
export class ParquetConverter {
  constructor(link) {
    this.link = link;
    this._exports = getGQP();
    this._downloadInfo = null;
    this._error = null;
    this._working = '';
    // this.convert();
  }

  async convert() {
    const { fromParquet } = await this._exports;
    let file;
    try {
      const response = await fetch(this.link);
      if (!response.ok) {
        throw new Error('Erro ao carregar o arquivo.');
      }
      const blob = await response.blob();
      file = blob;
      const parquetData = await getParquetData(file);
      const output = fromParquet(parquetData);
      const extension = '.geojson';
      const blobOptions = { type: 'application/geo+json' };
      const size = formatSize(output.data.length);
      const plural = output.records === 1 ? '' : 's';
      const summary = `${output.records} feature${plural}, ${size}`;
      const blob1 = new Blob([output.data], blobOptions);
      this._downloadInfo = {
        input: file,
        url: URL.createObjectURL(blob1),
        geo: formatJSON(output.geo),
        schema: output.schema.replaceAll('\t', '  '),
        summary,
      };
      const reader = new FileReader();
      reader.onload = function(event) {
        const geoJSONString = event.target.result;
      };
      reader.readAsText(blob1);
      return output.data; // Retornando os dados como prometido
    } catch (error) {
      console.error('Erro:', error);
      throw error; // Lançando novamente o erro para ser tratado externamente
    }
  }

  async convertAndReturnJSON() {
    try {
      const blobData = await this.convert(); // Esperando a conclusão da conversão
      const json = await new Response(blobData).json(); // Convertendo o blob para JSON
      return json; // Retornando o JSON convertido
    } catch (error) {
      throw error; // Lançando qualquer erro ocorrido durante a conversão
    }
  }
}

window.ParquetConverter = ParquetConverter;
