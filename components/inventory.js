import { addClickEvent, createItemStack, fixColorEncoding, givePlayerItemStack, isComponentOnScreen, measureString, noop, openProfile } from '../utils';
import { exitShader, useShader } from '../shaders';
import { emptyEffect, beforeChildrenDrawEffect, MetaEffect, escapeScissorEffect, conditionalEffect } from '../effects';
import * as Elementa from 'Elementa/index';
import { createPadding, createColoredText } from './utility';
import { getSetting } from '../settings';

const Color = Java.type('java.awt.Color');

/**
 * @param {any[]} inv 
 * @param {number} rowSize 
 * @returns {Elementa.UIContainer}
 */
export const createInv = (inv, rowSize=9) => {
  const root = new Elementa.UIContainer();
  const rowPixels = rowSize*18;
  root.setWidth(rowPixels.pixels())
  root.setHeight(new Elementa.ChildBasedSizeConstraint())
  for(let i = 0; i < inv.length/rowSize; i++){
    let row = new Elementa.UIContainer()
      .setWidth(rowPixels.pixels())
      .setHeight((18).pixels())
      .setX((0).pixels())
      .setY(new Elementa.SiblingConstraint())
    for(let j = 0; j < rowSize; j++){
      let item = createItem(inv[i*rowSize+j] || null);
      row.addChild(item);
    }
    root.addChild(row);
  }
  return root;
}

const defaultItemOptions = {
  onClick: noop,
  hoverable: true,
}

/**
 * warning scissor effect can break the lore
 * @param {PitPandaItem} item object representing the data
 * @param {{
 *  onClick: () => void,
 *  hoverable: boolean,
 * }} opts
 * @returns {Elementa.UIContainer}
 */
export const createItem = (item, opts = {}) => {
  const options = {...defaultItemOptions, ...opts};
  const comp = new Elementa.UIContainer()
    .setWidth((16).pixels())
    .setHeight((16).pixels())
  
  const padded = createPadding(comp, 1).setX(new Elementa.SiblingConstraint())

  if(item === null || (item.id === undefined && !item.itemstack)) return padded;

  item.name = fixColorEncoding(item.name);
  if(item.desc) item.desc = item.desc.map(fixColorEncoding);

  const itemstack = item.itemstack ?? createItemStack(item);

  if(getSetting('RemoveGlint')) { 
    const nbt = itemstack.func_77978_p() // getTagCompound
    if(nbt){
      nbt.func_82580_o('ench') // removeTag
      itemstack.func_77982_d(nbt); // setTagCompound
    }
  }
  const ctItem = new Item(itemstack);
  const drawItemEffect = beforeChildrenDrawEffect(() => {
    if(!item.count) useShader('greyscale');
    ctItem.draw(comp.getLeft(),comp.getTop());
    if(!item.count) exitShader();
  })
  const scale = 0.9;
  const textWidth = measureString(item.count+'')*scale;
  const itemCountEffect = beforeChildrenDrawEffect(() => {
    if(item.count>1) {
      Renderer.translate(0,0,400)
      Renderer.scale(scale)
      Renderer.drawStringWithShadow(item.count+'',(comp.getRight())/scale-textWidth, (comp.getBottom()-6)/scale)
    }
  });
  const effects = new MetaEffect(drawItemEffect, itemCountEffect);
  if(options.hoverable){
    const lore = createLore(item);
    const drawLoreEffect = beforeChildrenDrawEffect(() => {
      lore
        .setX((comp.getRight()+1).pixels())
        .setY((comp.parent.getTop()-1).pixels())
      shadowWindow.draw();
    });
    const hoverBackEffect = beforeChildrenDrawEffect(() => {
      Renderer.drawRect(
        0x28FFFFFF,
        comp.getLeft(), comp.getTop(),
        16, 16,
      );
    })
    let shadowWindow = null;
    comp.onMouseEnter(() => {
      shadowWindow = new Elementa.Window().addChild(lore)
      effects.add(drawLoreEffect, hoverBackEffect)
    });
    comp.onMouseLeave(() => {
      shadowWindow && shadowWindow.removeChild(lore);
      shadowWindow = null;
      effects.remove(drawLoreEffect, hoverBackEffect)
    });
  }

  comp.enableEffect(conditionalEffect(effects, isComponentOnScreen));

  addClickEvent(comp, () => {
    if(getSetting('DeveloperMode')) givePlayerItemStack(itemstack)
    options.onClick();
  });
  
  return padded;
}

/**
 * warning scissor effect can break the lore
 * @param {any} item object representing the data
 * @returns {Elementa.UIRoundedRectangle}
 */
export const createLore = item => {
  const desc = [item.name, ...item.desc];
  const root = new Elementa.UIRoundedRectangle(3)
    .setHeight((4+12*desc.length).pixels())
    .setColor(new Elementa.ConstantColorConstraint(new Color(0.1,.01,0.1,.95)))
    .enableEffects([
      {
        ...emptyEffect,
        beforeDraw: () => Renderer.translate(0,0,500),
        afterDraw: () => Renderer.translate(0,0,-500)
      },
      escapeScissorEffect()
    ])
  const lines = desc.map((line,i) => {
    const lineComp = createColoredText(line || ' ',4,12*i+4) //for some reaosn empty string breaks it
    root.addChild(lineComp);
    return lineComp;
  });
  root.setWidth((Math.max(...lines.map(l=>l.getWidth()))+8).pixels());
  return root;
}
