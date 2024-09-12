import mill._, scalalib._, scalajslib._, scalajslib.api._

// mill-scalablytyped is tied closely to the mill version, so using 'latest-release' to maintain this link (vs explicit version)
import $ivy.`com.github.lolgab::mill-scalablytyped::latest.release`, com.github.lolgab.mill.scalablytyped._

import $ivy.`io.github.nafg.millbundler::jsdeps::0.3.0`, io.github.nafg.millbundler.jsdeps._

trait AppScalaModule extends ScalaModule {
  def scalaVersion = "3.7.1"
}

trait AppScalaJSModule extends AppScalaModule with ScalaJSModule {
  def scalaJSVersion                             = "1.19.0"
  def moduleKind                                 = T { ModuleKind.ESModule }
  def moduleSplitStyle: Target[ModuleSplitStyle] = {
    val millModuleObjectName = this.getClass.getSimpleName.stripSuffix("$")
    T { ModuleSplitStyle.SmallModulesFor(List(millModuleObjectName)) }
  }
  def scalaJSSourceMap: T[Boolean] = Task { false }
}

object `package` extends RootModule with AppScalaModule {
  def moduleDeps = Seq(shared.jvm)

  object shared extends Module {
    trait SharedModule extends AppScalaModule with PlatformScalaModule {}
    object jvm         extends SharedModule
    object js          extends SharedModule with AppScalaJSModule with ScalaJSNpmModule
  }

  object client extends AppScalaJSModule with ScalaJSNpmModule {
    def moduleDeps = Seq(shared.js, st)
    def ivyDeps    = Agg(
      ivy"io.indigoengine::tyrian-io::0.14.0" // tyrian - purely functional ui library, virtual dom
    )
    def jsDeps = super.jsDeps() ++
      JsDeps(
        dependencies = Map(
          // note: scalablytyped causes build error, if no module is defined here
          "color" -> "*"
        ),
        devDependencies = Map(
          "typescript" -> "*" // requirement
        ),
        jsSources = Map(
          "optional.js" -> """console.log('optional inline js');""" // seems to be ignored - at least with this vite setup - so don't use
        )
      )

    object st extends AppScalaJSModule with ScalablyTyped {
      def scalablyTypedBasePath    = T { npm.npmInstall().path }
      def scalablyTypedIgnoredLibs = T { List[String]() }
    }

    object npm extends AppScalaJSModule with ScalaJSNpmModule {
      def jsDeps     = client.jsDeps
      def npmInstall = T {
        val p = super.npmInstall()
        os.copy.over(p.path / "node_modules", p.path / os.up / os.up / "node_modules")
        p
      }
    }

  }
}
