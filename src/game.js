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
    this.playerCounter = 0;
    this.NPCCounter = 0;
    this.canScore = true;
    this.gameOver = false;

    // Help for camera logic
    this.isFirstPerson = true;
    this.mainCam = null;
    this.altCam = null;

    this.ui = {
      playerScore: null,
      roundNumber: null,
      buttonInfo: null,
      gameState: null,
      enemyScore: null
      
    this.altCam = null

    // Sound Effects and Audio
    this.sounds = {
      roll: new Audio("assets/sounds/DiceRolling.wav"),
      stop: new Audio("assets/sounds/DiceStopped.wav"),
      win:  new Audio("assets/sounds/Victory.wav")
    };

    this.sounds.roll.loop = true;

    // UI Elements
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
        x: 90,
        y: 70,
        font: "12px Arial",
        color: "white"
    },
    {
        id: "message",
        text: "Starting Game Now!",
        x: 10,
        y: 140,
        font: "8px Arial",
        color: "white"
    }
  }

  // Obtain the Dice Value based on the face that is most upright
  getDiceValue(diceObject) {

    // Remember the WorldUp Vector
    const worldUp = vec3.fromValues(0, 1, 0);

    // Faces and their local directions
    // NOTE: Values for 4, 5, and 6 do not work due to the wrapping of the texture. This is fixed with another calibration function
    const faces = [
      { value: 3, dir: vec3.fromValues(0, 1, 0) },   // +Y
      { value: 4, dir: vec3.fromValues(0, -1, 0) },  // -Y
      { value: 5, dir: vec3.fromValues(1, 0, 0) },   // +X
      { value: 6, dir: vec3.fromValues(-1, 0, 0) },  // -X
      { value: 2, dir: vec3.fromValues(0, 0, 1) },   // +Z
      { value: 1, dir: vec3.fromValues(0, 0, -1) }   // -Z
    ];

    // Get the rotation and convert from a mat4 into a mat3 (Allows it to work better)
    const rot3 = mat3.create();
    mat3.fromMat4(rot3, diceObject.model.rotation);

    // Data for the best face that is the most upright
    let best = { value: null, dot: -999 };

    faces.forEach(face => {
      // Calculate the vector transform and normalize
      let transformed = vec3.create();
      vec3.transformMat3(transformed, face.dir, rot3);
      vec3.normalize(transformed, transformed);

      // Calculate the dot product between the transform and world vector
      let dot = vec3.dot(transformed, worldUp);

      // The dot product value will check to see if a new best is found
      if (dot > best.dot) {
      best.value = face.value;
      best.dot = dot;
      }
    });

    return best.value;
  }

  // Snap the die so the detected face stays perfectly upright
  snapDice(diceObject, faceValue) {

  // Faces and their local directions
  // NOTE: Same thing as the getDiceValue(diceObject), values for 4, 5, and 6 do not work due to the wrapping of the texture. This is fixed with another calibration function
  const rotations = {
    3: [ 0, 0, 0 ],                  // +Y
    5: [ Math.PI, 0, 0 ],             // -Y
    4: [ 0, 0, -Math.PI / 2 ],        // +X
    6: [ 0, 0,  Math.PI / 2 ],        // -X
    2: [ -Math.PI / 2, 0, 0 ],        // +Z
    1: [  Math.PI / 2, 0, 0 ]         // -Z
  };

  // If value is invalid
  const r = rotations[faceValue];
  if (!r) return;

  // Snap the dice to a hard locked rotation
  mat4.identity(diceObject.model.rotation);
  mat4.rotateX(diceObject.model.rotation, diceObject.model.rotation, r[0]);
  mat4.rotateY(diceObject.model.rotation, diceObject.model.rotation, r[1]);
  mat4.rotateZ(diceObject.model.rotation, diceObject.model.rotation, r[2]);
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
        this.NPCCounter += 1;
      }
    }
    console.log("NPC Dice roll results: ", rolled);
  }

  // For the console log: prints out instructions to how this variation of Yahtzee works
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

  /* UI Drawing Functions. The function name indicates what is being updated */
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

  updateMessage(value) {
    this.uiTexts.find(t => t.id === "message").text = value;
    this.drawUI();
  }

  doSomething() {
    console.log("Hello!");
  }

  /* Audio + Sound Effects Functions */
  playSound(name) {
    const s = this.sounds[name];
    if (!s) return;

    s.currentTime = 0;
    s.play();
  }

  stopSound(name) {
    const s = this.sounds[name];
    if (!s) return;

    s.pause();
    s.currentTime = 0;
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

    this.ui.playerScore = document.getElementById("playerScore");
    this.ui.playerScore.innerHTML = "Player Score: " + this.playerScore.toString();

    this.ui.roundNumber = document.getElementById("roundNumber");
    this.ui.roundNumber.innerHTML = "Round: " + this.currentRound.toString();

    this.ui.buttonInfo = document.getElementById("buttonGuide");
    this.ui.buttonInfo.innerHTML = "Press A to roll the dice!"

    this.ui.gameState = document.getElementById("gameState");
    this.ui.gameState.innerHTML = "Starting game!"

    this.ui.enemyScore = document.getElementById("enemyScore");
    this.ui.enemyScore.innerHTML = "Enemy Score: " + this.NPCScore.toString();

    // Set Dice and Floor into the Collidable Objects Array
    this.collidableObjects[0] = getObject(this.state, "Dice 1");
    this.collidableObjects[1] = getObject(this.state, "Dice 2");
    this.collidableObjects[2] = getObject(this.state, "Dice 3");
    this.collidableObjects[3] = getObject(this.state, "Dice 4");
    this.collidableObjects[4] = getObject(this.state, "Dice 5");
    this.collidableObjects[5] = getObject(this.state, "Table Top");
    
    // Create Sphere Colliders around our dice and objects
    for (let i = 0; i < 6; i++) {
      this.createSphereCollider(this.collidableObjects[i], 0.5);
    }

    // example - setting up a key press event to move an object in the scene
    document.addEventListener("keypress", (e) => {
      e.preventDefault();

      switch (e.key) {
        // Spin the Dice
        case "a":
          break;
        
        // Drop the Dice
        case "d":
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

        case "r":
          if (this.gameOver != false) {
            location.reload();
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
    for (let i = 0; i < 5; i++) {
      this.collidableObjects[i].rotate('x', this.multiplier * deltaTime / 3600 * (Math.random() * 10));
      this.collidableObjects[i].rotate('y', this.multiplier * deltaTime / 3600 * (Math.random() * 10));
    }

    document.addEventListener("keypress", (e) => {
      e.preventDefault();

      switch (e.key) {
        // Spin the Dice
        case "a":
          this.playSound("roll");
          if (this.gameOver != true) {
            this.multiplier = 10000;
            this.canScore = true;
            for (let i = 0; i < 5; i++) {
              this.collidableObjects[i].model.position[1] = 2.0;
            }
            //this.updateRound((this.currentRound + 1));
            
            //this.updateStatus("Press D to stop rolling!");
            this.ui.buttonInfo.innerHTML = "Press D to stop rolling the dice!";
            
            break;
          }
        // Stop the Dice
        case "d":
          this.multiplier = 0;
          this.stopSound("roll");
          this.playSound("stop");
          for (let i = 0; i < 5; i++) {
              this.collidableObjects[i].model.position[1] = 0;
          }
          break;

      }
    });

    //console.log(this.multiplier);

    // When dice stop spinning, read values to check results
    if (this.multiplier <= 0 && this.canScore == true) {

      this.multipier = 0;

      this.canScore = false;

      let results = [];

      // Your dice are in collidableObjects[0] to collidableObjects[4]
      for (let i = 0; i < 5; i++) {

        // Add calculated rolls to the results
        results.push(this.getDiceValue(this.collidableObjects[i]));

        // Dice Recalibration
        // NOTE: Due to how the textures are wrapped along the dice, the values 4, 5, and 6 are bugged. This list of if statements act as a way to 'recalibrate' those specific values
        let val = results[i];
        if (val == 4) {
          val = 5;
        }
        else if (val == 5) {
          val = 6;
        }
        else if (val == 6) {
          val = 4;
        }
        this.snapDice(this.collidableObjects[i], val);
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
          this.playerCounter += 1;
        }
      }
 
      // Console Log Print the Results
      console.log("The current round is: ", this.currentRound);
      console.log("The Player score is: ", this.playerScore);
      console.log("The NPC score is: ", this.NPCScore);
      
      // Update UIs
      /*
      // Update all UI Elements
      this.updateRound(this.currentRound);
      this.updateScore(this.playerScore);
      this.updateLives(this.NPCScore);
      this.updateMessage("This round: Player scored " + this.playerCounter + " while NPC scored " + this.NPCCounter);
      this.updateStatus("Press A to start rolling!");
      */
     this.ui.playerScore.innerHTML = "Player Score: " + this.playerScore.toString();
     this.ui.roundNumber.innerHTML = "Round: " + this.currentRound.toString();
     this.ui.buttonInfo.innerHTML = "Press A to start roll the dice!";
     this.ui.gameState.innerHTML = "This round: You scored " + this.playerCounter.toString() + " while NPC scored " + this.NPCCounter.toString();
     this.ui.enemyScore.innerHTML  = "Enemy Score: " + this.NPCScore.toString();

      // Refresh the points for the Player and NPC Counted this round
      this.playerCounter = 0;
      this.NPCCounter = 0;

      // Debug Logs
      //console.log("The current round is: ", this.currentRound);
      //console.log("The Player score is: ", this.playerScore);
      //console.log("The NPC score is: ", this.NPCScore);
  }

  // Once the final round has been finished (Round 6)
  if (this.currentRound === 6) {

    // Reset message to provide a small delay
    let message = ""; 

    if (this.playerScore > this.NPCScore) {
      //console.log("Player Wins!");
      this.ui.buttonInfo.innerHTML = "You WIN!"
      this.ui.gameState.innerHTML = "Press R to restart!"
      
    }
    else if (this.NPCScore > this.playerScore) {
      //console.log("NPC Wins!");
      this.ui.buttonInfo.innerHTML = "You LOST!"
      this.ui.gameState.innerHTML = "Press R to restart!"
    }
    else if (this.NPCScore === this.playerScore) {
      //console.log("Tied. No one wins.");
      this.ui.buttonInfo.innerHTML = "This game is a draw"
      this.ui.gameState.innerHTML = "Press R to restart!"
    }
    this.currentRound += 1;
    //this.updateMessage("Press R to restart game!");
    this.gameOver = true;
      this.updateStatus("");
      message = "Player Wins!";
    }
    else if (this.NPCScore > this.playerScore) {
      //console.log("NPC Wins!");
      this.updateStatus("");
      message = "NPC Wins!";
    }
    else if (this.NPCScore === this.playerScore) {
      //console.log("Tied. No one wins.");
      this.updateStatus("");
      message = "Nobody Wins!";
    }

    // Delay the sound effect and message until the reset
    setTimeout(() => {
      this.currentRound += 1;
      this.updateMessage("Press R to restart game!");
      this.gameOver = true;
      this.playSound("win");
      this.updateStatus(message);
    }, 1000);

  };
    /* THIS MARKS THE END OF THE GAMEPLAY LOOP */
  }
}
