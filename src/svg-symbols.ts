import fs = require('fs');
import path = require('path');
import minimist = require('minimist');
import jsdom = require('jsdom');
import svgo = require('svgo');

const red = '\u001b[31m';
const green = '\u001b[32m';
const reset = '\u001b[0m';

const handleError = (message: string): void => {
  console.error(`${red} ${message}`);
  process.exit(1);
};

console.log('hogeeeee');

const handleHelp = () => {
  const HELP_TEXT = `
  -----
  Usage:
  node svg-symbols.js --src=path/to/dir --out=filename.svg

  Options:
    --src (required) ... Source directory
    --out (required) ... Output file name
  -----

  Enjoy! 😺
  `;

  const argv = minimist(process.argv.slice(2));
  if (!argv.help) return;
  console.log(HELP_TEXT);
  process.exit(0);
};

const getArgv = (): minimist.ParsedArgs | void => {
  const argvErrors = [];
  const argv = minimist(process.argv.slice(2));

  if (!argv.src) argvErrors.push('`src` is required 🙏');
  if (!argv.out) argvErrors.push('`out` is required 🙏');

  if (argvErrors.length) {
    argvErrors.forEach((error) => {
      console.error(`${red} Invalid Argument: ${error}`);
    });
    process.exit(1);
  }

  return argv;
};

const createSvg = (): SVGSVGElement => {
  const SVG_SYMBOL =
    '<svg xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink"></svg>';
  const $ = new jsdom.JSDOM(SVG_SYMBOL);
  return $.window.document.querySelector('svg') as SVGSVGElement;
};

const getIcon = (src: string, file: string): SVGSVGElement | null => {
  const html = fs.readFileSync(path.join(src, file), 'utf8');
  return new jsdom.JSDOM(html).window.document.querySelector('svg');
};

const createSymbol = (
  icon: SVGSVGElement,
  basename: string,
): SVGSymbolElement => {
  const SYMBOL = '<symbol xmlns="http://www.w3.org/2000/svg"></symbol>';
  const $document = new jsdom.JSDOM(SYMBOL).window.document;
  const $symbol = $document.querySelector('symbol') as SVGSymbolElement;

  $symbol.id = basename;
  $symbol.innerHTML = icon.innerHTML;
  const viewBox = icon.getAttribute('viewBox');
  if (viewBox) $symbol.setAttribute('viewBox', viewBox);

  return $symbol;
};

const generateSvg = async (
  svgElement: SVGSVGElement,
  outPath: string,
): Promise<void> => {
  const XML_PROC_INSTRUCTIONS = '<?xml version="1.0" encoding="utf-8"?>';

  // TODO: Fix type of options
  const config = {
    plugins: [
      {
        name: 'preset-default',
        params: {
          overrides: {
            // eslint-disable-next-line
            // @ts-ignore
            removeUselessDefs: false,
            // eslint-disable-next-line
            // @ts-ignore
            removeScriptElement: true,
          },
        },
      },
    ],
  } as svgo.OptimizeOptions;
  const result = await svgo.optimize(svgElement.outerHTML, config);

  await fs.writeFileSync(outPath, `${XML_PROC_INSTRUCTIONS}${result.data}`);
  console.log(`${green}Success ✨${reset}\nCreated (or Updated): ${outPath}`);
};

(() => {
  handleHelp();

  const SVG_EXTENSION = '.svg';

  const argv = getArgv();
  if (!argv) return handleError('Invalid Argument');

  const outPath = path.resolve(__dirname, argv.out);
  const srcDir = path.resolve(__dirname, argv.src);
  const $svg = createSvg();

  fs.readdir(srcDir, (error, files): void => {
    if (error) return handleError(error.message);

    files.forEach((file) => {
      if (path.extname(file) !== SVG_EXTENSION) return;
      const basename = path.basename(file, SVG_EXTENSION);

      const $icon = getIcon(srcDir, file);
      if (!$icon) return handleError(`${path.basename} is not found 😇`);

      const $symbol = createSymbol($icon, basename);
      $svg.innerHTML = $svg.innerHTML + $symbol.outerHTML;
    });

    generateSvg($svg, outPath);
  });
})();
