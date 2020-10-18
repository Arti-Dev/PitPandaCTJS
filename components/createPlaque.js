import { sentenceCase } from '../utils';
import { createPlayerList } from './createPlayerName';
import * as Elementa from 'Elementa/index';
import { createCard } from './cards';

/**
 * @param {any} display 
 * @returns {Elementa.UIContainer}
 */
export const createPlaque = display => {
  if(display.display_type === 'plaque'){
    const description = new Elementa.UIWrappedText(
      display.description
        .filter(d=>d.type==='text')
        .map(d=>d.content)
        .join('\n')
        .replace(/\\n/g,'\n')
    ).setWidth(new Elementa.RelativeConstraint())
    const content = new Elementa.UIContainer()
      .setWidth((200).pixels())
      .setHeight(new Elementa.ChildBasedSizeConstraint())
      .addChild(description)
    if(display.alts){
      content.addChild(
        createPlayerList(display.alts)
          .setY(new Elementa.SiblingConstraint())
      )
    }
    return createCard(display.title, content);
  }else if(display.display_type === 'flag'){
    const notes = new Elementa.UIWrappedText(display.notes)
      .setWidth(new Elementa.RelativeConstraint())
    const content = new Elementa.UIContainer()
      .setWidth((200).pixels())
      .setHeight(new Elementa.ChildBasedSizeConstraint())
      .addChildren(notes)
    if(display.alts){
      content.addChild(
        createPlayerList(display.alts)
          .setY(new Elementa.SiblingConstraint())
      )
    }

    return createCard(sentenceCase(display.type), content);
  }else{
    throw new Error('Invalid display type')
  }
}
