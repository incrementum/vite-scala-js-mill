package client

import cats.effect.IO

import tyrian.*
import tyrian.Html.*
import tyrian.SVG.*
import tyrian.cmds.Logger

object Client extends TyrianIOApp[Msg, Model]:

  def main(args: Array[String]): Unit =
    stylesheets.load
    launch("main")

  def router: Location => Msg =
    Routing.none(Msg.NoOp)

  def init(flags: Map[String, String]): (Model, Cmd[IO, Msg]) =
    (Model.init, Cmd.None)

  def update(model: Model): Msg => (Model, Cmd[IO, Msg]) =
    case Msg.StartDrag(x, y) =>
      (model.copy(dragging = true, x = x, y = y), Cmd.None)
    case Msg.Drag(x, y) if model.dragging =>
      (model.copy(x = x, y = y), Cmd.None)
    case Msg.EndDrag =>
      (model.copy(dragging = false), Cmd.None)
    case _ =>
      (model, Cmd.None)

  def view(model: Model): Html[Msg] =

    // illustrating use of npm module
    // via scalablytyped generated facades
    import typings.color.mod.{default as COLOR}
    val baseColor    = COLOR("#FF0000")
    val lighterColor = baseColor.lighten(0.5).hex()

    svg(
      width  := "800",
      height := "600",
      onMouseMove(e => Msg.Drag(e.clientX, e.clientY)),
      onMouseUp(_ => Msg.EndDrag)
    )(
      circle(
        cx   := model.x.toString,
        cy   := model.y.toString,
        r    := "30",
        fill := lighterColor, // using
        onMouseDown(e => Msg.StartDrag(e.clientX, e.clientY))
      )
    )

  def subscriptions(model: Model): Sub[IO, Msg] =
    Sub.None

end Client

case class Model(x: Double, y: Double, dragging: Boolean)

object Model:
  def init: Model = Model(50, 50, false)

enum Msg:
  case StartDrag(x: Double, y: Double)
  case Drag(x: Double, y: Double)
  case EndDrag
  case NoOp
