/**
 * A plugin for Vite to integrate with Mill for building Scala.js projects.
 * 
 *    CREDITS
 * 
 *    This plugin slighlty adapts the original plugin for Scala.js projects to work with Vite, 
 *    but uses mill instead of sbt for the scala build tool. 
 * 
 *    based on: https://github.com/scala-js/vite-plugin-scalajs
 *    also see: https://www.scala-js.org/doc/tutorial/scalajs-vite.html
 * 
 * The plugin should also work with Windows.
 *   
 * DESCRIPTION
 *   
 *  When configuring the plugin in vite, you specify which mill scalajs module to integrate.
 * 
 *  Then the plugin provides two main functions:
 * 
 *   1 Integrates vite's buildStart events with mill's fastLinkJS or fullLinkJS depending on vite's run mode, 
 *     and returns the mill output paths to the generated artifacts to vite.
 * 
 *   2 Resolves any ts/js import statements of the form `import 'scalajs:xxx.js'` to mill's output directory.
 *      For instance, import `scalajs:xxx.js` maps to  `../out/client/fastLinkJS.dest/xxx.js`
 * 
 *   This allows a seamless development experience with Scala.js projects in Vite.
 * 
 * USAGE
 * 
 *  Configure `vite.config.js` to include the plugin and specify the mill module to integrate:
 * 
 *    import vitePluginMill from './vite-plugin-mill.ts';
 *    ... 
 *    plugins: [
 *      vitePluginMill({ millModule: 'client' })  // specify the mill module to build from `build.sc`
 *    ]
 * 
 *  Effects:
 * 
 *    Vite's (rollup's) `buildStart` will then call 
 * 
 *      `mill client.fastLinkJS` (dev mode) or 
 *      `mill client.fullLinkJS` (production mode)
 * 
 *    Vite's (rollup's) `resolveId` will then resolve any import statements of the form `import 'scalajs:xxx.js'` 
 *    to the mill output directory.
 */

import { spawn, SpawnOptions } from "child_process";
import { createLogger, type Plugin as VitePlugin } from "vite";

const pluginName = "vite-plugin-mill"

function extractPathMillOutput(input: string): string {
  const errorMessage = "Can't extract dest path from mill output"
  const lines = input.split('\n');
  for (const line of lines) {
    if (line.trim().startsWith('"dest":')) {
      const parts = line.split(':');
      const path = parts[parts.length - 1].trim().replace(/"/g, '');
      if (path.length !== 0) return path;
    }
  }
  throw new Error(errorMessage)
}

// run a mill task async and retrieve its output
import { exec } from 'child_process';

function showMillTask(task: string, cwd?: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const command = `mill show ${task}`;
    const child = exec(command, { cwd }, (error, stdout, stderr) => {
      if (error) {
        reject(new Error(`mill invocation failed:\n${stderr || error.message}`));
      } else {
        try {
          resolve(extractPathMillOutput(stdout));
        } catch (err) {
          reject(err);
        }
      }
    });

    // live output to terminal
    child.stdout?.on('data', data => process.stdout.write(data));
    child.stderr?.on('data', data => process.stderr.write(data));
  });
}

export interface ScalaJSPluginOptions {
  cwd?: string,
  millModule?: string,
  uriPrefix?: string,
}

export default function scalaJSPlugin(options: ScalaJSPluginOptions = {}): VitePlugin {
  const { cwd, millModule = `root`, uriPrefix } = options;
  const fullURIPrefix = uriPrefix ? (uriPrefix + ':') : 'scalajs:';
  let isDev: boolean | undefined = undefined;
  let millOutput: string | undefined = undefined;
  return {
    name: pluginName,
    configResolved(resolvedConfig) {
      isDev = resolvedConfig.mode === 'development';
    },
    // callback for when the build starts
    async buildStart(options) {
      if (isDev === undefined)
        throw new Error("configResolved must be called before buildStart");
      const task = isDev ? "fastLinkJS" : "fullLinkJS";
      const moduleTask = millModule ? `${millModule}.${task}` : task;
      const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      console.log(currentTime + " [" + pluginName + "] " + "mill show " + moduleTask);
      millOutput = await showMillTask(moduleTask, cwd);
    },
    // callback for when an asset is imported
    resolveId(source, importer, options) {
      if (millOutput === undefined)
        throw new Error("buildStart must be called before resolveId");
      if (!source.startsWith(fullURIPrefix))
        return null;
      const path = source.substring(fullURIPrefix.length);
      const fullPath = `${millOutput}/${path}`
      const currentTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      console.log(currentTime + " [" + pluginName + "] resolveId " + source + " --> " + fullPath);
      return fullPath
    },
  };
}