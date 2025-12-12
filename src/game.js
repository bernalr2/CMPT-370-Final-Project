class Game {
  constructor(state) {
    this.state = state;
    this.spawnedObjects = [];
    this.collidableObjects = [];

    // Game Tracking Logic
    this.multiplier = 1;
    this.currentRound = 0;
    this.playerScore = 0;
    this.NPCScore = 0;

    // Help for camera logic
    this.isFirstPerson = true;
    this.mainCam = null;
    this.altCam = null

    this.uiTexts = [
    {
        id: "player",
        text: "Score: 0",
        x: 10,
        y: 15,
        font: "12px Arial",
        color: "blue"
    },
    {
        id: "enemy",
        text: "Score: 0",
        x: 200,
        y: 140,
        font: "12px Arial",
        color: "red"
    },
    {
        id: "round",
        text: "Round: 0",
        x: 240,
        y: 15,
        font: "12px Arial",
        color: "white"
    },
    {
        id: "status",
        text: "Null",
        x: 140,
        y: 140,
        font: "12px Arial",
        color: "white"
    }
    ];
  }

  // Obtain the Dice Value based on the face that is most upright
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

  // Used for changing the camera perspective
  updateCamera(view){
    vec3.copy(this.state.camera.position, view.position);
    vec3.copy(this.state.camera.front, view.front);
    vec3.copy(this.state.camera.up, view.up);
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
  
  // This function calulates the NPC rolls instantly
  calculateNPCRolls(round) {
    let rolled = [];
    for (let i = 0; i < 5; i++) {
      let val = (Math.floor(Math.random() * 6)) + 1;
      rolled.push(val);
      //console.log("Value NPC Rolled: ", val);
      if (round == val) {
        this.NPCScore += 1;
      }
    }
    console.log("NPC Dice roll results: ", rolled);
  }

  // Print out the console to start the instructions of the modified Yahtzee
  startIntroduction() {
    console.log("Welcome to Yahtzee: WebGL Edition! To start rolling, hold the a button to spin the dice and hold the d button to stop rolling and get a score on the dice.");
    console.log("Once the dice stop moving, the values are scored on how many you achieved of each number.");
    console.log("For example: If this was round 1: we cound how many dice rolled 1 and that adds to our total score and etc.");
  }

  // Stop the rotation on the collided objects
  onCollide(object) {
    object.rotate('x', 0);
    object.rotate('y', 0);
  }

  /* UI Drawing Functions */
  drawUI() {
      ctx.clearRect(0, 0, textCanvas.width, textCanvas.height);

      for (let t of this.uiTexts) {
          ctx.font = t.font;
          ctx.fillStyle = t.color;
          ctx.fillText(t.text, t.x, t.y);
      }
  }

  updateRound(value) {
      this.uiTexts.find(t => t.id === "round").text = "Round: " + value;
      this.drawUI();
  }

  updateScore(value) {
      this.uiTexts.find(t => t.id === "player").text = "Player Score: " + value;
      this.drawUI();
  }

  updateLives(value) {
      this.uiTexts.find(t => t.id === "enemy").text = "Enemy Score: " + value;
      this.drawUI();
  }

  updateStatus(value) {
      this.uiTexts.find(t => t.id === "status").text = value;
      this.drawUI();
  }


  /* MAIN GAME LOOP (onStart() and onUpdate()) STARTS HERE */

  // runs once on startup after the scene loads the objects
  async onStart() {
    console.log("On start");

    // this just prevents the context menu from popping up when you right click
    document.addEventListener("contextmenu", (e) => {
      e.preventDefault();
    }, false);

    // Define Camera States
    const cam = this.state.camera;

    // Main Camera
    this.mainCam = {
      position: vec3.clone(cam.position),
      front:    vec3.clone(cam.front),
      up:       vec3.clone(cam.up),
    };

    // Alternate Camera
    this.altCam = {
      position: vec3.fromValues(0, 4, 0),  
      front:    vec3.fromValues(0, -1, 0),  
      up:       vec3.fromValues(0, 0, -1),  
    };

    this.updateRound(1);
    this.updateScore(0);
    this.updateLives(0);
    this.updateStatus("");

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
          break;
        
        // Drop the Dice
        case "d":
          //this.cube.translate(vec3.fromValues(-0.5, 0, 0));
          break;

        // Change Camera Perspective
        case "p":
          this.isFirstPerson = !(this.isFirstPerson);
          if (this.isFirstPerson){
            this.updateCamera(this.mainCam);
          }
          else{
            this.updateCamera(this.altCam);
          }
          break;

        default:
          break;
      }
    });

    // Start Game Instructions in Console Log
    this.startIntroduction();

  }

  // Runs once every frame non stop after the scene loads
  onUpdate(deltaTime) {

    // Added a Math.random() multiplier to make the objects rotate at different speeds
    this.collidableObjects[0].rotate('x', this.multiplier * deltaTime / 3600 * (Math.random() * 10));
    this.collidableObjects[1].rotate('x', this.multiplier * deltaTime / 3600 * (Math.random() * 10));
    this.collidableObjects[2].rotate('x', this.multiplier * deltaTime / 3600 * (Math.random() * 10));
    this.collidableObjects[3].rotate('x', this.multiplier * deltaTime / 3600 * (Math.random() * 10));
    this.collidableObjects[4].rotate('x', this.multiplier * deltaTime / 3600 * (Math.random() * 10));

    this.collidableObjects[0].rotate('y', this.multiplier * deltaTime / 3600 * (Math.random() * 10));
    this.collidableObjects[1].rotate('y', this.multiplier * deltaTime / 3600 * (Math.random() * 10));
    this.collidableObjects[2].rotate('y', this.multiplier * deltaTime / 3600 * (Math.random() * 10));
    this.collidableObjects[3].rotate('y', this.multiplier * deltaTime / 3600 * (Math.random() * 10));
    this.collidableObjects[4].rotate('y', this.multiplier * deltaTime / 3600 * (Math.random() * 10));

    document.addEventListener("keypress", (e) => {
      e.preventDefault();

      switch (e.key) {
        // Spin the Dice
        case "a":
          this.multiplier += 1;
          break;
        // Slow the Dice
        case "d":
          if (this.multiplier > 0) {
            this.multiplier -= 1;
          }
          else if (this.multiplier < 0) {
            this.multiplier = 0;
          }
          break;
      }
    });
    //console.log(this.multiplier);

    // When dice stop spinning, read values to check results
    if (this.multiplier === 0) {

      let results = [];

      // Your dice are in collidableObjects[0] to collidableObjects[4]
      for (let i = 0; i < 5; i++) {
        results.push(this.getDieValue(this.collidableObjects[i]));
      }

      // Log Player Roll results into an array
      console.log("Player Dice roll results: ", results);
      let sum = 0;
      for (let i = 0; i < results.length; i++) {
        sum += results[i];
      }
      //console.log("The sum of the players numbers is: ", sum);

      // Increment the round
      this.multiplier = 1;
      this.currentRound += 1;

      // Calculate NPC and Player Score
      this.calculateNPCRolls(this.currentRound);
      for (let i = 0; i < results.length; i++) {
        if (results[i] === this.currentRound) {
          this.playerScore += 1;
        }
      }
      
      // Update UIs
      this.updateRound(this.currentRound);
      this.updateScore(this.playerScore);
      this.updateLives(this.NPCScore);

      // Debug Logs
      //console.log("The current round is: ", this.currentRound);
      //console.log("The Player score is: ", this.playerScore);
      //console.log("The NPC score is: ", this.NPCScore);
  }

  // Once the final round has been finished (Round 6)
  if (this.currentRound === 6) {
    if (this.playerScore > this.NPCScore) {
      //console.log("Player Wins!");
      updateStatus("Player Wins!");
    }
    else if (this.NPCScore > this.playerScore) {
      //console.log("NPC Wins!");
      updateStatus("NPC Wins!");
    }
    else if (this.NPCScore === this.playerScore) {
      //console.log("Tied. No one wins.");
      updateStatus("Nobody Wins!");
    }
    this.currentRound += 1;

  };
    /* THIS MARKS THE END OF THE GAMEPLAY LOOP */
  }
}
