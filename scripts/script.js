const Scene = require('Scene');
const Diagnostics = require('Diagnostics');
const Textures = require('Textures');
const TouchGestures = require('TouchGestures');
const NativeUI = require('NativeUI');
const Reactive = require('Reactive');
const Patches = require('Patches');

const targets = {
  dessert : {
    hitbox: Scene.root.find('dessert hitbox'),
    plane: Scene.root.find('dessert'),
  },
  drink : {
    hitbox: Scene.root.find('drink hitbox'),
    plane: Scene.root.find('drink'),
  },
  main : {
    hitbox: Scene.root.find('main hitbox'),
    plane: Scene.root.find('main'),
  },
};

const current = {
  dessert: null,
  drink: null,
  main: null,
};

const tray = {
  main : {
    rect: Scene.root.find('main_rect'),
    name: Scene.root.find('main_name'),
    price: Scene.root.find('main_price'),
  },
  dessert : {
    rect: Scene.root.find('dessert_rect'),
    name: Scene.root.find('dessert_name'),
    price: Scene.root.find('dessert_price'),
  },
  drink : {
    rect: Scene.root.find('beverage_rect'),
    name: Scene.root.find('beverage_name'),
    price: Scene.root.find('beverage_price'),
  },
}

const picker = NativeUI.picker;
let pickerSubscription = null;

const defaultIndex = 0;

const randomTexture = Textures.get('random');


const menu = {
  dessert: [
    {
      filename: 'dessert_1',
      name: 'Dessert 1',
      price: '120',
    },
    {
      filename: 'dessert_2',
      name: 'Dessert 2',
      price: '110',
    },
    {
      filename: 'dessert_3',
      name: 'Dessert 3',
      price: '130',
    },
    {
      filename: 'dessert_4',
      name: 'Dessert 4',
      price: '100',
    },
    {
      filename: 'dessert_5',
      name: 'Dessert 5',
      price: '110',
    },
  ], 
  drink: [
    {
      filename: 'drink_1',
      name: 'Drink 1',
      price: '170',
    },
    {
      filename: 'drink_2',
      name: 'Drink 2',
      price: '150',
    },
    {
      filename: 'drink_3',
      name: 'Drink 3',
      price: '180',
    },
    {
      filename: 'drink_4',
      name: 'Drink 4',
      price: '120',
    },
    {
      filename: 'drink_5',
      name: 'Drink 5',
      price: '100',
    },
  ], 
  main: [
    {
      filename: 'main_1',
      name: 'Burger 1',
      price: '500',
    },
    {
      filename: 'main_2',
      name: 'Burger 2',
      price: '550',
    },
    {
      filename: 'main_3',
      name: 'Burger 3',
      price: '580',
    },
    {
      filename: 'main_4',
      name: 'Burger 4',
      price: '600',
    },
    {
      filename: 'main_5',
      name: 'Burger 5',
      price: '450',
    },
  ]
}

const tray_canvas = Scene.root.find('canvas');
hidePicker();

let found = false;

Patches.getBooleanValue('found').monitor().subscribe((arg) => {
  found = arg.newValue;
  if (arg.newValue === false) {
    hidePicker();
    Object.keys(targets).forEach((key) => {
      pickerMode = key;
      selectItem({newValue: 0});
      current[key] = null;
    });
    tray_canvas.hidden = true;
  } else {
    pickerMode = null;
    tray_canvas.hidden = false;
  }
});

function selectItem({newValue: val}) {
  let target = targets[pickerMode].plane;
  let target_tray = tray[pickerMode];
  current[pickerMode] = val;
  switch(val) {
    case 0: {
      target.material.diffuse = Textures.get('default_' + pickerMode);
      target_tray.rect.material.diffuse = Textures.get('default_' + pickerMode);
      target_tray.name.text = '?';
      target_tray.price.text = '?';
      break;
    }
    case 1: {
      const index = Math.floor(Math.random() * menu[pickerMode].length);
      target.material.diffuse = Textures.get(menu[pickerMode][index].filename);
      target_tray.rect.material.diffuse = Textures.get(menu[pickerMode][index].filename);
      target_tray.name.text = menu[pickerMode][index].name;
      target_tray.price.text = menu[pickerMode][index].price;
    } break;
    default: {
      target.material.diffuse = Textures.get(menu[pickerMode][val - 2].filename);
      target_tray.rect.material.diffuse = Textures.get(menu[pickerMode][val - 2].filename);
      target_tray.name.text = menu[pickerMode][val - 2].name;
      target_tray.price.text = menu[pickerMode][val - 2].price;
      break;
    }
  }
}

function configurePicker() {
  const items = menu[pickerMode].map((dish) => ({image_texture: Textures.get(dish.filename)}));
  items.unshift({image_texture: randomTexture});
  items.unshift({image_texture: Textures.get('default_' + pickerMode)});
  picker.configure({
    selectedIndex: (current[pickerMode] === null) ? defaultIndex: current[pickerMode],
    items: items,
  });
  picker.visible = Reactive.val(true);
  if (pickerSubscription) pickerSubscription.unsubscribe();
  pickerSubscription = picker.selectedIndex.monitor().subscribe(selectItem);
}

function hidePicker() {
  picker.visible = Reactive.val(false);
}

let pickerMode = null;
const containerX = Scene.root.find('container').transform.x;

Object.keys(targets).forEach((key) => {
  TouchGestures.onTap(targets[key].hitbox).subscribe(() => {
    if (containerX.pinLastValue() < 220) return;
    if (!found) return;
    if (pickerMode !== key) {
      pickerMode = key;
      configurePicker();
    }
  })
});

TouchGestures.onTap(Scene.root.find('hitbox1')).subscribe(() => {
  pickerMode = null;
  hidePicker();
});

TouchGestures.onTap(Scene.root.find('hitbox2')).subscribe(() => {
  pickerMode = null;
  hidePicker();
});
