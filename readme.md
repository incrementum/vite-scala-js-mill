# vite-scala-js-mill

Ever wanted to get started *tres* **Vite** with a **Tyrian**-driven **SPA** written in **Scala.JS** that's built with **Mill** and use **NPM** modules via **scalablytyped**?

This is a starter project that uses tyrian to display a single draggable svg circle, whose color has been modified via the color npm module to illustrate the integration of the following tools and libraries:

- [mill](https://mill-build.org/): scala and scala.js build tool

- [scalablytyped](https://scalablytyped.org/): creates scalajs facades from npm module types, implicitly adds them as dependencies to the project

- [mill-bundler](https://github.com/nafg/mill-bundler): "a mill plugin for managing NPM dependencies for Scala.js code, and bundling the output."

- [vitejs.dev](https://vitejs.dev/): fast roundtrip live-reloading development environment for coding web frontends.

- [vite-plugin-scalajs](https://github.com/scala-js/vite-plugin-scalajs): "a Vite plugin for Scala.js" - I adapted this plugin slightly so it integrates vite with mill instead of sbt. 

- [tyrian](https://tyrian.indigoengine.io/): "an Elm-inspired, purely functional UI library for Scala" - Of course, you can use any UI approach with this starter project. 


### CREDITS

Credits go to the authors of the tools above. The ```build.sc``` follows mostly the mill example project [5-webapp-scalajs-shared](https://github.com/com-lihaoyi/mill/tree/main/example/scalalib/web/5-webapp-scalajs-shared) and the [Getting Started with Sala.js and Vite](https://www.scala-js.org/doc/tutorial/scalajs-vite.html) tutorial. These were augmented with additional mill modules that work together to get the npm facades generation and bundling working in conjunction with vite.

# Quick Start (10 mins) 

(assumes some familiarity with mill, vscode and its scala-related extensions)

> **Note:** ScalablyTyped can take **several minutes** during the initial build, and will emit numerous warning messages while parsing TypeScript definitions and generating Scala.js facades. This is expected and part of its multi-phase processing.
>
> To avoid issues with long-running ScalablyTyped tasks during Metals' automatic import in VS Code, it's recommended to first run:
>
> ```sh
> ./mill client.fastLinkJS
> ```
>
> This warms up the build and ensures type facades are generated ahead of time. Subsequent VS Code imports via Metals should then complete smoothly.


```sh
# install mill (see available documentation)

# install npm (see available documentation)

# clone this repo
git clone https://github.com/incrementum/vite-scala-js-mill.git
cd vite-scala-js-mill

# have npm install vite and any other npm modules specified in package.json
npm install

# IN A FIRST TERMINAL: get the continuous scala and scala.js building going. This will also scalably type any npms specified in the build.sc file
./mill -w client.fastLinkJS

# open vscode with scala and metals extensions and have metals import the build file - check the metals output/log until done. Expect a longer processing time.
code . 

# IN A SECOND TERMINAL: start vite's continuous packaging. This will also invoke the 'vite-plugin-mill' which informs vite where to include the mill-generatated artifacts, namely your scala.js based web application
npm run dev

# open `client/src/Client.scala` to modify the frontend to your liking. See your changes applied as vite reloads. Refer to build.sc to include the scala, scala.js and npm libraries you need under the respective mill modules. Don't foget to re-import the build into metals when you change the build.sc file. Should you need to reset, delete /node_modules and /out. Happy coding!
```

# How it Works

**```package.json```** contains the basic setup to install and run Vite from NPM as ```npm run dev```

**```vite.config.js```** imports the ```vite-plugin-mill``` and points it to the mill module that we want to integrate Vite with: Vite now knows where to find and monitor the corresponding scala.js outputs

**```vite-plugin-mill```** adapts the ```vite-plugin-scalajs``` code so it works with mill: Vite will now trigger a mill fastLinkJS in its reload cycle. The plugin also resolves any scalajs related imports in your js/ts code. Refer to the comments in the plugin code for details.

**```index.html```** is the primary entry point and includes ```main.js``` which in turn imports ```scalajs:main.js```. The plugin resolves this to the entry point into your scala.js appliction: the main() function in ```Client.scala```.

**```main.js```** see above, just facilitates the delegation to the entrypoint of your scala.js app: the ```main()``` method in ```Client.scala```

**```build.sc```** follows the structure of mill's example project [5-webapp-scalajs-shared](https://github.com/com-lihaoyi/mill/tree/main/example/scalalib/web/5-webapp-scalajs-shared), so refer to its documentation as it guides where you will place any server, shared and client code. This starter project just illustrates client code, but the wider build structure is already in place, so you can add server and shared code easily. In addition, the build definition includes the scaffolding for adding npm modules/libraries. Add your modules right there and scalablytyped will generate the scala.js facades for them. The build then takes care of updating node_modules accordingly. Remember, when you add dependencies or otherwise update ```build.sc```, you must reimport it in vscode and also restart the mill/vite continuous build loops for your changes to take effect as any changes here impact the larger structure of your project. Also, the initial generating of scalajs facades does take some time depending on your npm requirements. For the details of how this works, refer to the documentation of the respective imported mill modules. 

**```Client.scala```** this is where your entrypoint to your scala.js code resides. Here we first load any stylesheets and then illustrate a simple tyrian UI. If you got the mill continuous build loop running (```mill -w client.fastLinkJS```) and vite monitoring for changes, then your code updates will be reflected upon vite reloads. 

# Additional Resources

https://github.com/snabbdom/snabbdom?tab=readme-ov-file

https://elmprogramming.com/virtual-dom.html

https://elmprogramming.com/

https://github.com/PurpleKingdomGames/tyrian/issues/192#issuecomment-1550363628
