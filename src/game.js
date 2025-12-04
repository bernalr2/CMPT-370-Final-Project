class Game {
  constructor(state) {
    this.state = state;
    this.spawnedObjects = [];
    this.collidableObjects = [];
    this.multiplier = 1;

    // Help for camera logic
    this.isFirstPerson = true;
    this.mainCam = null;
    this.altCam = null

  }

  getDieValue(dieObject) {

    const worldUp = vec3.fromValues(0, 1, 0);

    // Faces and their local directions
    const faces = [
      { value: 1, dir: vec3.fromValues(0, 1, 0) },   // +Y
      { value: 6, dir: vec3.fromValues(0, -1, 0) },  // -Y
      { value: 3, dir: vec3.fromValues(1, 0, 0) },   // +X
      { value: 4, dir: vec3.fromValues(-1, 0, 0) },  // -X
      { value: 2, dir: vec3.fromValues(0, 0, 1) },   // +Z
      { value: 5, dir: vec3.fromValues(0, 0, -1) }   // -Z
    ];

    // (already a 4×4, but we use only the 3×3 upper-left part)
    const rot3 = mat3.create();
    mat3.fromMat4(rot3, dieObject.model.rotation);

    let best = { value: null, dot: -999 };

    faces.forEach(face => {
      let transformed = vec3.create();
      vec3.transformMat3(transformed, face.dir, rot3);
      vec3.normalize(transformed, transformed);

      let dot = vec3.dot(transformed, worldUp);

      if (dot > best.dot) {
      best.value = face.value;
      best.dot = dot;
      }
    });

    return best.value;
  }

  updateCamera(view){
    console.log("Update camera called");
    vec3.copy(this.state.camera.position, view.position);
    vec3.copy(this.state.camera.front, view.front);
    vec3.copy(this.state.camera.up, view.up);
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


    

    const cam = this.state.camera;

    this.mainCam = {
      position: vec3.clone(cam.position),
      front:    vec3.clone(cam.front),
      up:       vec3.clone(cam.up),
    };

    
    this.altCam = {
      position: vec3.fromValues(0, 4, 0),  
      front:    vec3.fromValues(0, -1, 0),  
      up:       vec3.fromValues(0, 0, -1),  
    };


    // example - set an object in onStart before starting our render loop!
    //this.cube = getObject(this.state, "cube1");
    //const otherCube = getObject(this.state, "cube2"); // we wont save this as instance var since we dont plan on using it in update

    // NEW - Set Dice and Floor into the Objects
    this.collidableObjects[0] = getObject(this.state, "Dice 1");
    this.collidableObjects[1] = getObject(this.state, "Dice 2");
    this.collidableObjects[2] = getObject(this.state, "Dice 3");
    this.collidableObjects[3] = getObject(this.state, "Dice 4");
    this.collidableObjects[4] = getObject(this.state, "Dice 5");
    this.collidableObjects[5] = getObject(this.state, "Table Top");
    
    // example - create sphere colliders on our two objects as an example, we give 2 objects colliders otherwise
    this.createSphereCollider(this.collidableObjects[0], 0.5);
    this.createSphereCollider(this.collidableObjects[1], 0.5);
    this.createSphereCollider(this.collidableObjects[2], 0.5);
    this.createSphereCollider(this.collidableObjects[3], 0.5);
    this.createSphereCollider(this.collidableObjects[4], 0.5);
    this.createSphereCollider(this.collidableObjects[5], 0.5);
    //this.createSphereCollider(otherCube, 0.5);

    // example - setting up a key press event to move an object in the scene
    document.addEventListener("keypress", (e) => {
      e.preventDefault();

      switch (e.key) {
        // Spin the Dice
        case "a":
          //this.cube.translate(vec3.fromValues(0.5, 0, 0));
          /*this.collidableObjects[0].rotate('x', 5.0);
          this.collidableObjects[1].rotate('x', 5.0);
          this.collidableObjects[2].rotate('x', 5.0);
          this.collidableObjects[3].rotate('x', 5.0);
          this.collidableObjects[4].rotate('x', 5.0);

          this.collidableObjects[0].rotate('y', 5.0);
          this.collidableObjects[1].rotate('y', 5.0);
          this.collidableObjects[2].rotate('y', 5.0);
          this.collidableObjects[3].rotate('y', 5.0);
          this.collidableObjects[4].rotate('y', 5.0);*/
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
    this.collidableObjects[0].rotate('x', this.multiplier * deltaTime / 3600);
    this.collidableObjects[1].rotate('x', this.multiplier * deltaTime / 3600);
    this.collidableObjects[2].rotate('x', this.multiplier * deltaTime / 3600);
    this.collidableObjects[3].rotate('x', this.multiplier * deltaTime / 3600);
    this.collidableObjects[4].rotate('x', this.multiplier * deltaTime / 3600);

    this.collidableObjects[0].rotate('y', this.multiplier * deltaTime / 3600);
    this.collidableObjects[1].rotate('y', this.multiplier * deltaTime / 3600);
    this.collidableObjects[2].rotate('y', this.multiplier * deltaTime / 3600);
    this.collidableObjects[3].rotate('y', this.multiplier * deltaTime / 3600);
    this.collidableObjects[4].rotate('y', this.multiplier * deltaTime / 3600);
    document.addEventListener("keypress", (e) => {
      e.preventDefault();

      switch (e.key) {
        case "a":
          this.multiplier += 1;
          break;
        case "d":
          if (this.multiplier > 0) {
            this.multiplier -= 1;
          }
          else if (this.multiplier < 0) {
            this.multiplier = 0;
          }
          break;
        case "p":
          console.log("P is pressed");
          this.isFirstPerson = !(this.isFirstPerson);
          if (this.isFirstPerson){
            this.updateCamera(this.mainCam);
          }
          else{
            this.updateCamera(this.altCam);
          }
          break;
      }
    });
    //console.log(this.multiplier);
    // When dice stop spinning, read values
    if (this.multiplier === 0) {

      let results = [];

      // Your dice are in collidableObjects[0] to collidableObjects[4]
      for (let i = 0; i < 5; i++) {
        results.push(this.getDieValue(this.collidableObjects[i]));
      }

      console.log("Dice roll results: ", results);
      let sum = 0;
      for (let i = 0; i < results.length; i++) {
        sum += results[i];
      }
      console.log("The sum of all numbers is: ", sum);
  }


    //console.log(this.multiplier);
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
