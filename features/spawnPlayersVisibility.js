import { getSetting, subscribeToSetting } from "../settings";
import { onEnterPit, getMap } from "../utils";

let currentHeight = Infinity;
const mapHeights = {
  'Genesis': 85.5,
  'Four Seasons': 113.5,
  'Elements': 113.5,
  'Abyss': 113.5,
  'Castle': 94.5,
}

const renderInSpawnTrigger = register('renderEntity', (entity, pos, pticks, event) => {
  if(
    entity.getClassName().equals('EntityOtherPlayerMP') &&
    entity.getY() > currentHeight && 
    Math.abs(entity.getX()) < 20 && 
    Math.abs(entity.getZ()) < 20
  ) event.setCanceled(true);
}).unregister();

onEnterPit(() => {
  getMap().then(map => {
    if(map in mapHeights) currentHeight = mapHeights[map];
  });

  if(!getSetting('SpawnPlayersVisibility')) renderInSpawnTrigger.register();

  const subscription = subscribeToSetting('SpawnPlayersVisibility', state => {
    if(state) renderInSpawnTrigger.unregister();
    else renderInSpawnTrigger.register();
  });

  return () => {
    renderInSpawnTrigger.unregister();
    subscription.unsubscribe();
  }
});
