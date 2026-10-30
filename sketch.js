
// ================================================
// WHY BOTHER? — SIMULACIÓN COMPUTACIONAL
// WANDER / SEARCH / GENERATE
// ================================================

let particles = [];
let targets = [];
let draftTargets = [];
let roughTargets = [];
let nearTargets = [];
let buttons = [];

const TOTAL_PARTICLES = 2600;

let mode = "WANDER";
let modeFrame = 0;

// SEARCH: duración de cada etapa a 60 FPS
const PHASE_1 = 480;
const PHASE_2 = 720;
const PHASE_3 = 720;
const PHASE_4 = 600;
const PHASE_5 = 600;

// GENERATE
let generateStyle = -1;
let generationState = "IDLE";
let generationStart = 0;
const generationDuration = 5200;
let generationProgress = 0;
let forceBlockNext = false;
let forceBlockCurrent = false;
let currentMessage = "";

// Mensajes de generación
const generationMessages = [
    { time: 0.00, text: "Analizando solicitud..." },
    { time: 0.10, text: "Interpretando referencias visuales..." },
    { time: 0.23, text: "Explorando posibilidades creativas..." },
    { time: 0.38, text: "Preparando el boceto..." },
    { time: 0.52, text: "Creando primera versión..." },
    { time: 0.68, text: "Refinando composición..." },
    { time: 0.82, text: "Aplicando detalles y texturas..." },
    { time: 0.95, text: "Finalizando imagen..." }
];

// ================================================
// ESTILOS DE GENERACIÓN
// ================================================

const styles = [
    {
        name: "EDITORIAL",
        font: "Georgia",
        color: "#F0E9D8",
        bg: "#111111",
        size: 1,
        italic: false,
        effect: "lines"
    },
    {
        name: "DIGITAL",
        font: "Arial",
        color: "#55E7FF",
        bg: "#101B32",
        size: 1.08,
        italic: false,
        effect: "glow"
    },
    {
        name: "EXPERIMENTAL",
        font: "Georgia",
        color: "#FF75AE",
        bg: "#28111F",
        size: 1.05,
        italic: true,
        effect: "rings"
    },
    {
        name: "RETRO",
        font: "Impact",
        color: "#FFD77A",
        bg: "#3A2418",
        size: 1.15,
        italic: false,
        effect: "frame"
    },
    {
        name: "MONOSPACE",
        font: "Courier New",
        color: "#A9F5B0",
        bg: "#101C16",
        size: 0.85,
        italic: false,
        effect: "grid"
    },
    {
        name: "NEON",
        font: "Arial",
        color: "#B58AFF",
        bg: "#100B24",
        size: 1.1,
        italic: false,
        effect: "glowRings"
    },
    {
        name: "BOLD",
        font: "Impact",
        color: "#FF694D",
        bg: "#20100C",
        size: 1.2,
        italic: false,
        effect: "frame"
    },
    {
        name: "MINIMAL",
        font: "Arial",
        color: "#FFFFFF",
        bg: "#080808",
        size: 1,
        italic: false,
        effect: "none"
    }
];

// ================================================
// SETUP
// ================================================

function setup() {

    pixelDensity(1);

    let canvas = createCanvas(windowWidth, windowHeight);
    canvas.parent("canvas-container");

    createArtwork();
    createButtons();
}

// ================================================
// CREAR OBRA
// ================================================

function createArtwork() {

    particles = [];
    targets = [];
    draftTargets = [];
    roughTargets = [];
    nearTargets = [];

    let pg = createGraphics(width, height);
    pg.pixelDensity(1);

    let fontSize = min(150, width / 9, height / 3);

    pg.background(0);
    pg.fill(255);
    pg.noStroke();
    pg.textAlign(CENTER, CENTER);
    pg.textStyle(BOLD);
    pg.textFont("Arial");
    pg.textSize(fontSize);

    pg.text("WHY BOTHER?", width / 2, height / 2);

    pg.loadPixels();

    // Obtener posiciones de la tipografía
    for (let x = 0; x < width; x += 3) {

        for (let y = 0; y < height; y += 3) {

            let index = (x + y * width) * 4;

            if (pg.pixels[index] > 128) {
                targets.push(createVector(x, y));
            }
        }
    }

    pg.remove();

    targets = shuffle(targets);

    let amount = min(TOTAL_PARTICLES, targets.length);

    // Crear versiones alternativas de la palabra
    for (let i = 0; i < amount; i++) {

        let t = targets[i];

        // Primera versión: abstracta y orgánica
        let angle = i * 0.13;
        let radius = 50 + (i % 180) * 1.2;

        draftTargets.push(createVector(
            width / 2 + cos(angle) * radius,
            height / 2 + sin(angle) * radius * 0.55
        ));

        // Segunda versión: letras deformadas
        roughTargets.push(createVector(
            t.x + random(-65, 65),
            t.y + random(-35, 35)
        ));

        // Tercera versión: letras casi correctas
        nearTargets.push(createVector(
            t.x + random(-13, 13),
            t.y + random(-9, 9)
        ));
    }

    // Crear partículas
    for (let i = 0; i < amount; i++) {

        particles.push({

            pos: createVector(
                random(width),
                random(height)
            ),

            vel: p5.Vector.random2D(),

            target: targets[i].copy(),
            draft: draftTargets[i].copy(),
            rough: roughTargets[i].copy(),
            near: nearTargets[i].copy(),

            size: random(1.5, 2.5),
            seed: random(1000)
        });
    }

    background(8);
}

// ================================================
// BOTONES
// ================================================

function createButtons() {

    let buttonWidth = 120;
    let gap = 12;

    let totalWidth = buttonWidth * 3 + gap * 2;
    let startX = (width - totalWidth) / 2;

    buttons = [
        {
            label: "01  WANDER",
            mode: "WANDER",
            x: startX
        },
        {
            label: "02  SEARCH",
            mode: "SEARCH",
            x: startX + buttonWidth + gap
        },
        {
            label: "03  GENERATE",
            mode: "GENERATE",
            x: startX + (buttonWidth + gap) * 2
        }
    ];

    for (let b of buttons) {
        b.y = height - 65;
        b.w = buttonWidth;
        b.h = 38;
    }
}

// ================================================
// CAMBIAR DE MODO
// ================================================

function setMode(newMode) {

    mode = newMode;
    modeFrame = 0;

    createArtwork();

    if (mode === "WANDER") {
        resetWander();
    }

    if (mode === "GENERATE") {

        generateStyle = -1;
        generationState = "IDLE";

        forceBlockNext = false;
        forceBlockCurrent = false;

        startGeneration();
    }
}

// ================================================
// DRAW PRINCIPAL
// ================================================

function draw() {

    modeFrame++;

    if (mode === "GENERATE") {

        drawGenerateExperience();
        drawInterface();

        return;
    }

    background(8, 8, 8, 30);

    if (mode === "WANDER") {
        wanderMode();
    }

    else if (mode === "SEARCH") {
        searchMode();
    }

    drawInterface();
}


function wanderMode() {

    wanderAge++;

    // ==========================================
    // 1. APARICIÓN PROGRESIVA DE FENÓMENOS
    // ==========================================

    // No aparecen fenómenos inmediatamente.
    // Se deja que las partículas exploren primero.

    if (
        wanderAge >= nextWanderEvent &&
        wanderEvents.length < 2
    ) {

        let types = [
            "vortex",
            "wave",
            "filament",
            "attractor",
            "burst"
        ];

        let type = random(types);

        wanderEvents.push({

            type: type,

            x: random(width * 0.12, width * 0.88),
            y: random(height * 0.12, height * 0.88),

            radius: random(130, 290),

            strength: random(0.08, 0.15),

            angle: random(TWO_PI),

            phase: random(TWO_PI),

            direction: random([-1, 1]),

            age: 0,

            duration: random(220, 360)
        });

        // Próximo fenómeno en un momento diferente
        nextWanderEvent = wanderAge + floor(random(180, 340));
    }


    // ==========================================
    // 2. ACTUALIZAR VIDA DE LOS FENÓMENOS
    // ==========================================

    for (let i = wanderEvents.length - 1; i >= 0; i--) {

        wanderEvents[i].age++;

        if (wanderEvents[i].age >= wanderEvents[i].duration) {
            wanderEvents.splice(i, 1);
        }
    }


    // ==========================================
    // 3. CUADRÍCULA ESPACIAL
    // ==========================================

    const cellSize = 65;

    const cols = Math.ceil(width / cellSize);
    const rows = Math.ceil(height / cellSize);

    let grid = new Map();

    for (let p of particles) {

        let cx = Math.floor(p.pos.x / cellSize);
        let cy = Math.floor(p.pos.y / cellSize);

        let key = cx + "," + cy;

        if (!grid.has(key)) {
            grid.set(key, []);
        }

        grid.get(key).push(p);
    }


    // ==========================================
    // 4. INTERACCIÓN ENTRE PARTÍCULAS
    // ==========================================

    for (let p of particles) {

        let cohesion = createVector(0, 0);
        let separation = createVector(0, 0);
        let alignment = createVector(0, 0);

        let neighbors = 0;

        let cx = Math.floor(p.pos.x / cellSize);
        let cy = Math.floor(p.pos.y / cellSize);

        for (let ox = -1; ox <= 1; ox++) {
            for (let oy = -1; oy <= 1; oy++) {

                let nearby = grid.get(
                    (cx + ox) + "," + (cy + oy)
                );

                if (!nearby) continue;

                for (let other of nearby) {

                    if (other === p) continue;

                    let dx = other.pos.x - p.pos.x;
                    let dy = other.pos.y - p.pos.y;

                    let d = Math.sqrt(dx * dx + dy * dy);

                    if (d > 0 && d < 65) {

                        cohesion.add(other.pos);
                        alignment.add(other.vel);

                        if (d < 23) {

                            separation.x -= dx / d;
                            separation.y -= dy / d;
                        }

                        neighbors++;
                    }
                }
            }
        }

        if (neighbors > 0) {

            cohesion.div(neighbors);
            cohesion.sub(p.pos);
            cohesion.mult(0.009);

            alignment.div(neighbors);
            alignment.sub(p.vel);
            alignment.mult(0.018);

            separation.mult(0.12);
        }


        // ==========================================
        // 5. EXPLORACIÓN LIBRE
        // ==========================================

        // Movimiento individual
        let randomForce = p5.Vector.random2D();
        randomForce.mult(0.10);

        // Movimiento orgánico e impredecible
        let angle = noise(
            p.pos.x * 0.002 + p.seed,
            p.pos.y * 0.002 + p.seed,
            wanderAge * 0.002
        ) * TWO_PI * 3;

        let organicForce = p5.Vector.fromAngle(angle);
        organicForce.mult(0.14);


        // ==========================================
        // 6. FENÓMENOS TEMPORALES
        // ==========================================

        let eventForce = createVector(0, 0);
        let smallParticleEffect = 0;

        for (let e of wanderEvents) {

            let center = createVector(
                e.x + sin(e.age * 0.012 + e.phase) * 25,
                e.y + cos(e.age * 0.014 + e.phase) * 25
            );

            let dir = p5.Vector.sub(p.pos, center);

            let d = dir.mag();

            if (d < e.radius && d > 1) {

                dir.normalize();

                // El fenómeno aparece, crece y desaparece
                let progress = e.age / e.duration;
                let envelope = sin(progress * PI);

                let influence = (1 - d / e.radius) * envelope;

                let force = createVector(0, 0);


                // VÓRTICE
                if (e.type === "vortex") {

                    force.set(-dir.y, dir.x);

                    force.mult(
                        e.strength *
                        influence *
                        e.direction
                    );

                    // Ligera atracción hacia el centro
                    let inward = dir.copy();
                    inward.mult(-e.strength * influence * 0.3);

                    force.add(inward);
                }


                // ONDAS
                else if (e.type === "wave") {

                    let pulse = sin(
                        d * 0.045 -
                        e.age * 0.10 +
                        e.phase
                    );

                    force = dir.copy();

                    force.mult(
                        pulse *
                        e.strength *
                        influence *
                        2
                    );
                }


                // LÍNEAS Y FILAMENTOS
                else if (e.type === "filament") {

                    let axis = createVector(
                        cos(e.angle + sin(e.age * 0.012) * 0.6),
                        sin(e.angle + sin(e.age * 0.012) * 0.6)
                    );

                    let perpendicular = createVector(
                        -axis.y,
                        axis.x
                    );

                    let relative = p5.Vector.sub(p.pos, center);

                    let distanceFromLine = abs(
                        p5.Vector.dot(relative, perpendicular)
                    );

                    if (distanceFromLine < 50) {

                        let side = p5.Vector.dot(
                            relative,
                            perpendicular
                        );

                        // Acercamiento a la línea
                        let pull = perpendicular.copy();

                        pull.mult(
                            -Math.sign(side) *
                            e.strength *
                            influence
                        );

                        // Desplazamiento a lo largo de ella
                        let along = axis.copy();

                        along.mult(
                            e.strength *
                            influence *
                            e.direction
                        );

                        force.add(pull);
                        force.add(along);
                    }
                }


                // AGRUPACIONES
                else if (e.type === "attractor") {

                    force = dir.copy();

                    force.mult(
                        -e.strength *
                        influence
                    );
                }


                // DISPERSIÓN
                else if (e.type === "burst") {

                    force = dir.copy();

                    let pulse = sin(e.age * 0.07 + e.phase);

                    force.mult(
                        e.strength *
                        influence *
                        (1.5 + pulse)
                    );
                }

                eventForce.add(force);

                smallParticleEffect += influence;
            }
        }


        // ==========================================
        // 7. COMBINAR MOVIMIENTOS
        // ==========================================

        p.vel.add(randomForce);
        p.vel.add(organicForce);

        p.vel.add(cohesion);
        p.vel.add(alignment);
        p.vel.add(separation);

        p.vel.add(eventForce);

        p.vel.mult(0.95);
        p.vel.limit(3.2);

        p.pos.add(p.vel);

        wrapParticle(p);

        drawParticle(p);


        // ==========================================
        // 8. PEQUEÑOS PUNTOS SECUNDARIOS
        // ==========================================

        if (
            smallParticleEffect > 0.5 &&
            random() < 0.045
        ) {

            noStroke();

            fill(235, 235, 225, 120);

            circle(
                p.pos.x + random(-7, 7),
                p.pos.y + random(-7, 7),
                random(0.8, 1.6)
            );
        }
    }
}


// ================================================
// WANDER — CONTROL DE FENÓMENOS
// ================================================

let wanderEvents = [];
let wanderAge = 0;
let nextWanderEvent = 0;

function resetWander() {

    wanderEvents = [];

    wanderAge = 0;

    // Entre 4 y 6 segundos de exploración libre
    nextWanderEvent = floor(random(240, 360));
}


// ================================================
// 02 — SEARCH
// ================================================

function searchMode() {

    let stage = getSearchStage();

    for (let p of particles) {

        // FASE 1: EXPLORACIÓN LIBRE
        if (stage === 1) {

            let angle = noise(
                p.pos.x * 0.005 + p.seed,
                p.pos.y * 0.005,
                modeFrame * 0.003
            ) * TWO_PI * 3;

            let movement = p5.Vector.fromAngle(angle);
            movement.mult(0.9);

            p.vel.add(movement);
            p.vel.add(p5.Vector.random2D().mult(0.15));

            p.vel.mult(0.91);
            p.vel.limit(2);

            p.pos.add(p.vel);

            wrapParticle(p);
        }

        // FASE 2: EXPERIMENTACIÓN
        else if (stage === 2) {

            approachTarget(
                p,
                p.draft,
                0.009,
                0.45
            );
        }

        // FASE 3: PRIMER BOCETO
        else if (stage === 3) {

            approachTarget(
                p,
                p.rough,
                0.010,
                0.35
            );
        }

        // FASE 4: REFINAMIENTO
        else if (stage === 4) {

            approachTarget(
                p,
                p.near,
                0.018,
                0.12
            );
        }

        // FASE 5: RESULTADO DEFINITIVO
        else if (stage === 5) {

            approachTarget(
                p,
                p.target,
                0.035,
                0.015
            );
        }

        drawParticle(p);
    }
}

// ================================================
// ETAPAS DE SEARCH
// ================================================

function getSearchStage() {

    let time = modeFrame;

    if (time < PHASE_1) return 1;

    time -= PHASE_1;
    if (time < PHASE_2) return 2;

    time -= PHASE_2;
    if (time < PHASE_3) return 3;

    time -= PHASE_3;
    if (time < PHASE_4) return 4;

    return 5;
}

// ================================================
// ACERCAMIENTO A OBJETIVOS
// ================================================

function approachTarget(p, target, attraction, noiseAmount) {

    let angle = noise(
        p.pos.x * 0.004 + p.seed,
        p.pos.y * 0.004,
        modeFrame * 0.002
    ) * TWO_PI * 3;

    let exploration = p5.Vector.fromAngle(angle);
    exploration.mult(noiseAmount);

    p.pos.add(exploration);
    p.pos.lerp(target, attraction);
}

// ================================================
// 03 — GENERATE: INICIAR GENERACIÓN
// ================================================

function startGeneration() {

    if (generationState === "PROCESSING") return;

    // Seleccionar un nuevo estilo
    generateStyle++;

    if (generateStyle >= styles.length) {
        generateStyle = 0;
    }

    generationState = "PROCESSING";

    generationStart = millis();
    generationProgress = 0;

    // Comprobar si esta generación debe bloquearse
    forceBlockCurrent = forceBlockNext;
    forceBlockNext = false;

    currentMessage = generationMessages[0].text;
}

// ================================================
// 03 — GENERATE: EXPERIENCIA COMPLETA
// ================================================

function drawGenerateExperience() {

    if (generationState === "PROCESSING") {

        background("#080B12");

        let elapsed = millis() - generationStart;

        generationProgress = constrain(
            elapsed / generationDuration,
            0,
            1
        );

        // Buscar mensaje correspondiente al progreso
        for (let i = generationMessages.length - 1; i >= 0; i--) {

            if (generationProgress >= generationMessages[i].time) {

                currentMessage = generationMessages[i].text;
                break;
            }
        }

        // Terminar generación
        if (generationProgress >= 1) {

            if (forceBlockCurrent) {
                generationState = "BLOCKED";
            } else {
                generationState = "COMPLETE";
            }
        }

        if (generationState === "PROCESSING") {
            drawProcessingWindow();
        }
    }

    if (generationState === "COMPLETE") {

        drawGeneratedArtwork(styles[generateStyle]);
    }

    if (generationState === "BLOCKED") {

        drawBlockedWindow();
    }
}

// ================================================
// VENTANA DE PROCESAMIENTO
// ================================================

function drawProcessingWindow() {

    let panelW = min(480, width - 40);
    let panelH = 245;

    let panelX = (width - panelW) / 2;
    let panelY = (height - panelH) / 2;

    push();

    // Panel
    rectMode(CORNER);

    stroke("#263C5C");
    strokeWeight(1);
    fill("#0C1422");

    rect(
        panelX,
        panelY,
        panelW,
        panelH,
        10
    );

    // Encabezado
    noStroke();
    fill("#DDEBFF");

    textAlign(LEFT, CENTER);
    textSize(12);

    text(
        "AI IMAGE GENERATION",
        panelX + 22,
        panelY + 25
    );

    fill("#55A8FF");
    textAlign(RIGHT, CENTER);
    textSize(9);

    text(
        "PROCESSING",
        panelX + panelW - 22,
        panelY + 25
    );

    // Campo de partículas azules
    drawBlueParticles(
        panelX + 15,
        panelY + 50,
        panelW - 30,
        105
    );

    // Mensaje dinámico
    fill("#78B7FF");
    textAlign(LEFT, CENTER);
    textSize(12);

    text(
        currentMessage,
        panelX + 22,
        panelY + 177
    );

    // Porcentaje
    fill("#DDEBFF");
    textAlign(RIGHT, CENTER);
    textSize(12);

    text(
        floor(generationProgress * 100) + "%",
        panelX + panelW - 22,
        panelY + 177
    );

    // Barra de progreso
    noStroke();
    fill("#1B2A40");

    rect(
        panelX + 22,
        panelY + 200,
        panelW - 44,
        5,
        5
    );

    fill("#399BFF");

    rect(
        panelX + 22,
        panelY + 200,
        (panelW - 44) * generationProgress,
        5,
        5
    );

    pop();
}

// ================================================
// PARTÍCULAS AZULES DE PROCESAMIENTO
// ================================================

function drawBlueParticles(x, y, w, h) {

    push();

    noStroke();

    let cols = 37;
    let rows = 7;

    let spacingX = w / (cols - 1);
    let spacingY = h / (rows - 1);

    for (let i = 0; i < cols; i++) {

        for (let j = 0; j < rows; j++) {

            let wave = sin(
                frameCount * 0.09 - i * 0.23 + j * 0.35
            );

            let wave2 = cos(
                frameCount * 0.045 + i * 0.13
            );

            let pulse = (wave + wave2 + 2) / 4;

            let n = noise(
                i * 0.15,
                j * 0.2,
                frameCount * 0.012
            );

            let radius = 1.2 + pulse * 3.2 + n * 1.5;

            let px = x + i * spacingX;

            let py = y + j * spacingY
                + sin(frameCount * 0.04 + i * 0.2) * 4;

            let alpha = 65 + pulse * 175;

            fill(48, 145, 255, alpha);

            circle(
                px,
                py,
                radius * 2
            );
        }
    }

    // Ondas luminosas
    for (let k = 0; k < 3; k++) {

        let waveX = x + (
            (frameCount * 1.5 + k * w / 3) % w
        );

        stroke(55, 145, 255, 35);
        strokeWeight(1);

        line(
            waveX,
            y,
            waveX,
            y + h
        );
    }

    pop();
}

// ================================================
// RESULTADO GENERADO
// ================================================

function drawGeneratedArtwork(s) {

    background(s.bg);

    push();

    let baseSize = min(
        150,
        width / 9,
        height / 3
    ) * s.size;

    textAlign(CENTER, CENTER);
    textFont(s.font);
    textStyle(s.italic ? ITALIC : NORMAL);

    textSize(baseSize);

    noStroke();
    fill(s.color);

    if (s.effect === "glow") {

        drawingContext.shadowBlur = 24;
        drawingContext.shadowColor = s.color;
    }

    text(
        "WHY BOTHER?",
        width / 2,
        height / 2
    );

    drawingContext.shadowBlur = 0;
    drawingContext.shadowColor = "transparent";

    pop();

    drawStyleDecoration(s);

    // Información del resultado
    push();

    noStroke();
    fill(s.color);

    textAlign(CENTER, CENTER);
    textSize(10);

    text(
        "GENERATED OUTPUT / " + nf(generateStyle + 1, 2),
        width / 2,
        height - 110
    );

    textSize(9);

    text(
        "STYLE: " + s.name,
        width / 2,
        height - 94
    );

    pop();
}

// ================================================
// DECORACIONES DE ESTILOS
// ================================================

function drawStyleDecoration(s) {

    push();

    noFill();
    stroke(s.color);
    strokeWeight(0.6);

    let margin = width * 0.15;

    if (s.effect === "lines") {

        line(
            margin,
            height * 0.30,
            width - margin,
            height * 0.30
        );

        line(
            margin,
            height * 0.70,
            width - margin,
            height * 0.70
        );
    }

    else if (
        s.effect === "rings" ||
        s.effect === "glowRings"
    ) {

        for (let i = 0; i < 5; i++) {

            let d = 90 + i * 45;

            ellipse(
                width / 2,
                height / 2,
                d * 2,
                d * 1.2
            );
        }
    }

    else if (s.effect === "frame") {

        rect(
            margin,
            height * 0.25,
            width - margin * 2,
            height * 0.5
        );
    }

    else if (s.effect === "grid") {

        for (let i = 0; i < 12; i++) {

            let yy = height * 0.25 + i * 8;

            line(
                margin,
                yy,
                width - margin,
                yy
            );
        }
    }

    pop();
}

// ================================================
// RESULTADO BLOQUEADO
// ================================================

function drawBlockedWindow() {

    background("#090B10");

    let panelW = min(460, width - 40);
    let panelH = 210;

    let x = (width - panelW) / 2;
    let y = (height - panelH) / 2;

    push();

    fill("#151820");
    stroke("#713E4A");
    strokeWeight(1);

    rect(
        x,
        y,
        panelW,
        panelH,
        10
    );

    noStroke();

    fill("#FF7D88");
    textAlign(LEFT, CENTER);
    textSize(12);

    text(
        "GENERATION INTERRUPTED",
        x + 25,
        y + 30
    );

    fill("#F0DDE0");
    textSize(12);

    text(
        "The requested image could not be generated.",
        x + 25,
        y + 85
    );

    fill("#A9AAB2");
    textSize(10);

    text(
        "A simulated safety restriction was detected.",
        x + 25,
        y + 110
    );

    fill("#FF8993");
    textSize(10);

    text(
        "PRESS SPACE TO TRY AGAIN",
        x + 25,
        y + 165
    );

    pop();
}

// ================================================
// PARTÍCULAS
// ================================================

function drawParticle(p) {

    noStroke();

    fill(235, 235, 225, 220);

    circle(
        p.pos.x,
        p.pos.y,
        p.size
    );
}

// ================================================
// LÍMITES DEL LIENZO
// ================================================

function wrapParticle(p) {

    if (p.pos.x < 0) p.pos.x = width;
    if (p.pos.x > width) p.pos.x = 0;

    if (p.pos.y < 0) p.pos.y = height;
    if (p.pos.y > height) p.pos.y = 0;
}

// ================================================
// INTERFAZ
// ================================================

function drawInterface() {

    let s = mode === "GENERATE" && generateStyle >= 0
        ? styles[generateStyle]
        : null;

    push();

    textAlign(CENTER, CENTER);
    noStroke();

    fill(s ? s.color : 150);
    textSize(10);

    text(
        "AN EXPERIMENT ABOUT THE CREATIVE PROCESS",
        width / 2,
        30
    );

    fill(s ? s.color : 240);
    textSize(15);

    text(
        "WHY BOTHER?",
        width / 2,
        57
    );

    let description = "";

    if (mode === "WANDER") {

        description = "EXPLORATION WITHOUT A DESTINATION";
    }

    else if (mode === "SEARCH") {

        let descriptions = [
            "",
            "01 / INITIAL CHAOS",
            "02 / EXPERIMENTATION",
            "03 / FIRST DRAFT",
            "04 / REFINEMENT",
            "05 / FINAL RESULT"
        ];

        description = descriptions[getSearchStage()];
    }

    else if (mode === "GENERATE") {

        if (generationState === "PROCESSING") {
            description = "AI SYSTEM / PROCESSING REQUEST";
        }

        else if (generationState === "BLOCKED") {
            description = "AI SYSTEM / REQUEST INTERRUPTED";
        }

        else {
            description = "GENERATED STYLE: " + (s ? s.name : "");
        }
    }

    fill(s ? s.color : 150);
    textSize(10);

    text(
        description,
        width / 2,
        height - 91
    );

    // Botones
    for (let b of buttons) {

        let active = mode === b.mode;

        stroke(active ? 230 : 75);
        strokeWeight(1);

        fill(active ? 230 : 8);

        rect(
            b.x,
            b.y,
            b.w,
            b.h,
            4
        );

        noStroke();
        fill(active ? 8 : 190);

        textSize(10);

        text(
            b.label,
            b.x + b.w / 2,
            b.y + b.h / 2
        );
    }

    fill(s ? s.color : 90);
    textSize(9);

    if (mode === "GENERATE") {

        if (generationState === "PROCESSING") {

            text(
                "E: SIMULATE BLOCK",
                width / 2,
                height - 15
            );
        }

        else {

            text(
                "SPACE / G: NEW VERSION     E: SIMULATE BLOCK",
                width / 2,
                height - 15
            );
        }
    }

    else {

        text(
            "SELECT AN EXPERIENCE",
            width / 2,
            height - 15
        );
    }

    pop();
}

// ================================================
// INTERACCIÓN CON EL MOUSE
// ================================================

function mousePressed() {

    for (let b of buttons) {

        if (
            mouseX >= b.x &&
            mouseX <= b.x + b.w &&
            mouseY >= b.y &&
            mouseY <= b.y + b.h
        ) {

            if (mode === b.mode) {

                if (
                    mode === "GENERATE" &&
                    generationState !== "PROCESSING"
                ) {
                    startGeneration();
                }

                return;
            }

            setMode(b.mode);
            return;
        }
    }
}

// ================================================
// INTERACCIÓN CON EL TECLADO
// ================================================

function keyPressed() {

    if (mode === "GENERATE") {

        // ESPACIO O G: NUEVA GENERACIÓN
        if (
            key === " " ||
            key.toLowerCase() === "g"
        ) {

            if (generationState !== "PROCESSING") {
                startGeneration();
            }

            return false;
        }

        // E: SIMULAR ERROR DE SEGURIDAD
        if (key.toLowerCase() === "e") {

            if (generationState === "PROCESSING") {

                // Bloquear generación actual
                forceBlockCurrent = true;

                currentMessage =
                    "Verificando restricciones de seguridad...";

            }

            else {

                // Programar bloqueo para la siguiente generación
                forceBlockNext = true;

                startGeneration();
            }

            return false;
        }
    }

    // CAMBIAR DE EXPERIENCIA
    if (key === "1") {
        setMode("WANDER");
    }

    if (key === "2") {
        setMode("SEARCH");
    }

    if (key === "3") {
        setMode("GENERATE");
    }
}

// ================================================
// REDIMENSIONAR VENTANA
// ================================================

function windowResized() {

    resizeCanvas(windowWidth, windowHeight);

    createArtwork();
    createButtons();

    if (mode === "GENERATE") {

        generationState = "IDLE";

        forceBlockNext = false;
        forceBlockCurrent = false;

        startGeneration();
    }
}
