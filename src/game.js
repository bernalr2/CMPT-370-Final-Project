class Game {
  constructor(state) {
    this.state = state;
    this.spawnedObjects = [];
    this.collidableObjects = [];
    this.dice = [];
  }

  // example - we can add our own custom method to our game and call it using 'this.customMethod()'
  customMethod() {
    console.log("Custom method!");
  }

  
  // example - create a collider on our object with various fields we might need (you will likely need to add/remove/edit how this works)
  createSphereCollider(object, radius, onCollide = null) {
    object.collider = {
      type: "SPHERE",
      radius: radius,
      onCollide: onCollide ? onCollide : (otherObject) => {
        console.log(`Collided with ${otherObject.name}`);
      }
    };
    this.collidableObjects.push(object);
  }

  // example - function to check if an object is colliding with collidable objects
  checkCollision(object) {
    // loop over all the other collidable objects 
    this.collidableObjects.forEach(otherObject => {
      // probably don't need to collide with ourselves
      if (object.name === otherObject.name) {
        return;
      }
      // do a check to see if we have collided, if we have we can call object.onCollide(otherObject) which will
      // call the onCollide we define for that specific object. This way we can handle collisions identically for all
      // objects that can collide but they can do different things (ie. player colliding vs projectile colliding)
      // use the modeling transformation for object and otherObject to transform position into current location
      // ie: 
      if (collide){ object.collider.onCollide(otherObject) } // fires what we defined our object should do when it collides
    });
  }

  // Stop the rotation on the collided objects
  onCollide(object) {
    object.rotate('x', 0);
    object.rotate('y', 0);
  }

  // runs once on startup after the scene loads the objects
  async onStart() {
    console.log("On start");

    // this just prevents the context menu from popping up when you right click
    document.addEventListener("contextmenu", (e) => {
      e.preventDefault();
    }, false);

    // example - set an object in onStart before starting our render loop!
    //this.cube = getObject(this.state, "cube1");
    //const otherCube = getObject(this.state, "cube2"); // we wont save this as instance var since we dont plan on using it in update

    // NEW - Set Dice into Dice Array
    this.dice[0] = getObject(this.state, "Dice 1");
    this.dice[1] = getObject(this.state, "Dice 2");
    this.dice[2] = getObject(this.state, "Dice 3");
    this.dice[3] = getObject(this.state, "Dice 4");
    this.dice[4] = getObject(this.state, "Dice 5");
    
    // NEW - Create the Colliders on the Objects
    // no collision can happen
    this.createSphereCollider(this.dice[0], 0.5, (otherObject) => {
      console.log(`This is a custom collision of ${otherObject.name}`)
    });
    this.createSphereCollider(this.dice[1], 0.5, (otherObject) => {
      console.log(`This is a custom collision of ${otherObject.name}`)
    });
    this.createSphereCollider(this.dice[2], 0.5, (otherObject) => {
      console.log(`This is a custom collision of ${otherObject.name}`)
    });
    this.createSphereCollider(this.dice[3], 0.5, (otherObject) => {
      console.log(`This is a custom collision of ${otherObject.name}`)
    });
    this.createSphereCollider(this.dice[4], 0.5, (otherObject) => {
      console.log(`This is a custom collision of ${otherObject.name}`)
    });
    this.createSphereCollider(this.dice[5], 0.5, (otherObject) => {
      console.log(`This is a custom collision of ${otherObject.name}`)
    });

    //this.createSphereCollider(otherCube, 0.5);

    // example - setting up a key press event to move an object in the scene
    document.addEventListener("keypress", (e) => {
      e.preventDefault();

      switch (e.key) {
        // Spin the Dice
        case "a":
          //this.cube.translate(vec3.fromValues(0.5, 0, 0));
          this.dice[0].rotate('x', 5.0);
          this.dice[1].rotate('x', 5.0);
          this.dice[2].rotate('x', 5.0);
          this.dice[3].rotate('x', 5.0);
          this.dice[4].rotate('x', 5.0);

          this.dice[0].rotate('y', 5.0);
          this.dice[1].rotate('y', 5.0);
          this.dice[2].rotate('y', 5.0);
          this.dice[3].rotate('y', 5.0);
          this.dice[4].rotate('y', 5.0);
          break;
        
        // Drop the Dice
        case "d":
          //this.cube.translate(vec3.fromValues(-0.5, 0, 0));
          break;

        default:
          break;
      }
    });

    this.customMethod(); // calling our custom method! (we could put spawning logic, collision logic etc in there ;) )

    // example: spawn some stuff before the scene starts
    // for (let i = 0; i < 10; i++) {
    //     for (let j = 0; j < 10; j++) {
    //         for (let k = 0; k < 10; k++) {
    //             spawnObject({
    //                 name: `new-Object${i}${j}${k}`,
    //                 type: "cube",
    //                 material: {
    //                     diffuse: randomVec3(0, 1)
    //                 },
    //                 position: vec3.fromValues(4 - i, 5 - j, 10 - k),
    //                 scale: vec3.fromValues(0.5, 0.5, 0.5)
    //             }, this.state);
    //         }
    //     }
    // }

    // example: spawn in objects, set constantRotate to true for them (used below) and give them a collider
    //   for (let i = 0; i < 2; i++) {
    //     let tempObject = await spawnObject({
    //       name: `new-Object${i}`,
    //       type: "cube",
    //       material: {
    //         diffuse: randomVec3(0, 1)
    //       },
    //       position: vec3.fromValues(4 - i, 0, 0),
    //       scale: vec3.fromValues(0.5, 0.5, 0.5)
    //     }, this.state);


    //     tempObject.constantRotate = true;         // lets add a flag so we can access it later
    //     this.spawnedObjects.push(tempObject);     // add these to a spawned objects list
    //     this.collidableObjects.push(tempObject);  // say these can be collided into
    //   }
  }

  // Runs once every frame non stop after the scene loads
  onUpdate(deltaTime) {
    // TODO - Here we can add game logic, like moving game objects, detecting collisions, you name it. Examples of functions can be found in sceneFunctions

    // example: Rotate a single object we defined in our start method
    this.dice[0].rotate('x', deltaTime * 1.0);
    this.dice[1].rotate('x', deltaTime * 1.0);
    this.dice[2].rotate('x', deltaTime * 0.5);
    this.dice[3].rotate('x', deltaTime * 0.5);
    this.dice[4].rotate('x', deltaTime * 0.5);

    this.dice[0].rotate('y', deltaTime * 1.0);
    this.dice[1].rotate('y', deltaTime * 1.0);
    this.dice[2].rotate('y', deltaTime * 0.5);
    this.dice[3].rotate('y', deltaTime * 0.5);
    this.dice[4].rotate('y', deltaTime * 0.5);
    // this.cube.rotate('x', deltaTime * 0.5);

    // example: Rotate all objects in the scene marked with a flag
    // this.state.objects.forEach((object) => {
    //   if (object.constantRotate) {
    //     object.rotate('y', deltaTime * 0.5);
    //   }
    // });

    // simulate a collision between the first spawned object and 'cube' 
    // if (this.spawnedObjects[0].collidable) {
    //     this.spawnedObjects[0].onCollide(this.cube);
    // }

    // example: Rotate all the 'spawned' objects in the scene
    // this.spawnedObjects.forEach((object) => {
    //     object.rotate('y', deltaTime * 0.5);
    // });


    // example - call our collision check method on our cube
    // this.checkCollision(this.cube);
  }
}
