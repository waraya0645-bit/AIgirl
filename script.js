// Netlify Preview test
const TILE_SIZE = 32;

// ========================
// マップデータ
// ========================

// 0 = 草
// 1 = 壁

const mapData = [
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,1,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,1,1,1,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0],
    [0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0]
];

const MAP_HEIGHT = mapData.length;
const MAP_WIDTH = mapData[0].length;


// ========================
// ゲーム設定
// ========================

const config = {
    type: Phaser.AUTO,

    width: 1280,
    height: 720,

    backgroundColor: "#222222",

    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },

    input: {
        activePointers: 2
    },

    scene: {
        create: create,
        update: update
    }
};
const game = new Phaser.Game(config);


// ========================
// 変数
// ========================

let player;

let joystickBase;
let joystickKnob;

let joystickActive = false;

let joystickDX = 0;
let joystickDY = 0;

const JOYSTICK_RADIUS = 50;
const KNOB_RADIUS = 22;

const PLAYER_SPEED = 2.5;


// ========================
// ゲーム開始
// ========================

function create() {

    // ========================
    // タイルマップを表示
    // ========================

    for (let y = 0; y < MAP_HEIGHT; y++) {

        for (let x = 0; x < MAP_WIDTH; x++) {

            const tile = mapData[y][x];

            let color;

            if (tile === 0) {
                // 草
                color = 0x6b8e5a;
            }

            else if (tile === 1) {
                // 壁
                color = 0x4b4035;
            }

            this.add.rectangle(
                x * TILE_SIZE + TILE_SIZE / 2,
                y * TILE_SIZE + TILE_SIZE / 2,
                TILE_SIZE,
                TILE_SIZE,
                color
            );
        }
    }


    // ========================
    // プレイヤー
    // ========================

    player = this.add.rectangle(
        40,
        40,
        12,
        12,
        0xffffff
    );


    // ========================
    // カメラ
    // ========================

    const mapPixelWidth =
        MAP_WIDTH * TILE_SIZE;

    const mapPixelHeight =
        MAP_HEIGHT * TILE_SIZE;

    this.cameras.main.setBounds(
        0,
        0,
        mapPixelWidth,
        mapPixelHeight
    );

    this.cameras.main.startFollow(player);


    // ========================
    // ジョイスティック
    // ========================

    joystickBase = this.add.circle(
        100,
        210,
        JOYSTICK_RADIUS,
        0xffffff,
        0.35
    );

    joystickKnob = this.add.circle(
        100,
        210,
        KNOB_RADIUS,
        0x000000,
        0.7
    );

    // カメラとは別に画面に固定
    joystickBase.setScrollFactor(0);
    joystickKnob.setScrollFactor(0);

    // 最初は非表示
    joystickBase.setVisible(false);
    joystickKnob.setVisible(false);


    // ========================
    // タッチ開始
    // ========================

    this.input.on("pointerdown", function(pointer) {

        joystickActive = true;

        // タッチした場所に土台を出す
        joystickBase.setPosition(
            pointer.x,
            pointer.y
        );

        joystickKnob.setPosition(
            pointer.x,
            pointer.y
        );

        joystickBase.setVisible(true);
        joystickKnob.setVisible(true);

        joystickDX = 0;
        joystickDY = 0;
    });


    // ========================
    // タッチ中
    // ========================

    this.input.on("pointermove", function(pointer) {

        if (!joystickActive || !pointer.isDown) {
            return;
        }

        const baseX = joystickBase.x;
        const baseY = joystickBase.y;

        let dx = pointer.x - baseX;
        let dy = pointer.y - baseY;

        const distance = Math.sqrt(
            dx * dx + dy * dy
        );


        // ========================
        // スティックの範囲制限
        // ========================

        if (distance > JOYSTICK_RADIUS) {

            dx =
                dx / distance *
                JOYSTICK_RADIUS;

            dy =
                dy / distance *
                JOYSTICK_RADIUS;
        }


        // 黒いノブを動かす
        joystickKnob.setPosition(
            baseX + dx,
            baseY + dy
        );


        // -1 ～ 1 に変換
        joystickDX =
            dx / JOYSTICK_RADIUS;

        joystickDY =
            dy / JOYSTICK_RADIUS;
    });


    // ========================
    // タッチ終了
    // ========================

    this.input.on("pointerup", function() {

        joystickActive = false;

        joystickDX = 0;
        joystickDY = 0;

        joystickBase.setVisible(false);
        joystickKnob.setVisible(false);
    });
}


// ========================
// 毎フレーム
// ========================

function update() {

    if (!player) {
        return;
    }


    // ========================
    // スティックで移動
    // ========================

    player.x +=
        joystickDX * PLAYER_SPEED;

    player.y +=
        joystickDY * PLAYER_SPEED;


    // ========================
    // マップ外に出ないようにする
    // ========================

    player.x = Phaser.Math.Clamp(
        player.x,
        6,
        MAP_WIDTH * TILE_SIZE - 6
    );

    player.y = Phaser.Math.Clamp(
        player.y,
        6,
        MAP_HEIGHT * TILE_SIZE - 6
    );
}
