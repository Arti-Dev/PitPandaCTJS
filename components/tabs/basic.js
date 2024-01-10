import * as Elementa from 'Elementa/index';
import { theColor, white } from '../../constants';
import { backgroundEffect, MetaEffect, outlineEffect } from '../../effects';
import { createPadding } from '../utility';

const Color = Java.type('java.awt.Color');

 /**
 * @param {Tab} tab
 * @param {TabComponentHandlerOptions} options 
 * @returns {TabComponentHandler}
 */
export const createBasicTab = (tab, options) => {
  /**
   * @param {string} name 
   */
  const genNameComp = name => new Elementa.UIText(name)
    .setX((4).pixels())
    .setY(new Elementa.CenterConstraint());

  let exitButton = new Elementa.UIContainer()
    .setX(new Elementa.AdditiveConstraint(
      new Elementa.SiblingConstraint(),
      (4).pixels(),
    ))
    .setY(new Elementa.CenterConstraint())
    .addChild(new Elementa.UIText('§7X'))
    .setWidth(new Elementa.ChildBasedSizeConstraint())
    .setHeight(new Elementa.ChildBasedSizeConstraint())
    .onMouseEnter(() => exitButton.clearChildren().addChild(new Elementa.UIText('§cX')))
    .onMouseLeave(() => exitButton.clearChildren().addChild(new Elementa.UIText('§7X')))

  const bgEff = new JavaAdapter(Elementa.Effect, MetaEffect(backgroundEffect(theColor)));
  // const bgEff = new JavaAdapter(Elementa.Effect, new MetaEffect({
  //   boundComponent: undefined,
  //   beforeDrawEffect(UMatrixStack) {
  //     Renderer.drawRect(Renderer.color(theColor.red,theColor.green,theColor.blue,theColor.alpha), this.boundComponent.getLeft(), this.boundComponent.getTop(), 
  //     this.boundComponent.getWidth(), this.boundComponent.getHeight())
  //   },
  //   beforeDraw: noop,
  //   afterDraw: noop,
  //   bindComponent(comp) {
  //     this.boundComponent = comp
  //   },
  // }))

  let tabComponent = new Elementa.UIContainer()
    .enableEffect(bgEff)
    .setHeight((20).pixels())
    .setWidth(
      new Elementa.AdditiveConstraint(
        new Elementa.ChildBasedSizeConstraint(),
        (12).pixels(),
      )
    )
    .enableEffect(new JavaAdapter(Elementa.Effect, outlineEffect(white ,1)))
    .addChildren([
      genNameComp(),
      exitButton,
    ])
    .onMouseClick(() => {
      if(exitButton.isHovered()) options.onExit();
      else options.onClick();
    })

  return {
    component: createPadding(tabComponent, 4).setX(new Elementa.SiblingConstraint()),
    update(){
      tabComponent.clearChildren().addChildren([
        genNameComp(tab.getName()),
        exitButton,
      ])
    },
    focused(){
      bgEff.enable();
    },
    unfocused(){
      bgEff.disable();
    },
  }
}
