import { spawn } from 'child_process';
import { Gpio } from 'onoff';
import * as Pubnub from 'pubnub';

import { BlinkMessage } from '@curiosity-foundation/types-messages';

import * as T from 'fp-ts/Task';
import * as E from 'fp-ts/Either';
import { log } from 'fp-ts/Console';
import { pipe } from 'fp-ts/function';
import { sequenceT } from 'fp-ts/Apply';

const checkWifiConnection: T.Task<unknown> =
    () => new Promise((res, rej) => {

        const proc = spawn('iwgetid', ['-r']);

        proc.stdout.on('data', (data: any) => {
            console.log(`iwgetid: ${data}`);
        });

        proc.stderr.on('data', (data: any) => {
            console.error(`iwgetid: ${data}`);
        });

        proc.on('close', res);

    });

const startWifiConnect: T.Task<unknown> =
    () => new Promise((res, rej) => {

        const proc = spawn(`${process.cwd()}/wifi-connect`, []);

        proc.stdout.on('data', (data: any) => {
            console.log(`wifi-connect: ${data}`);
        });

        proc.stderr.on('data', (data: any) => {
            console.error(`wifi-connect: ${data}`);
        });

        proc.on('close', res);

    });

const LED = new Gpio(4, 'out'); //use GPIO pin 4, and specify that it is output

const listen: T.Task<void> =
    () => new Promise((res, rej) => {

        const pubnub = new Pubnub({
            publishKey: String(process.env.PUBNUB_PUB_KEY),
            subscribeKey: String(process.env.PUBNUB_SUB_KEY),
            uuid: 'raspi',
        });

        function blinkLED() { //function to start blinking
            if (LED.readSync() === 0) { //check the pin state, if the state is 0 (or off)
                LED.writeSync(1); //set pin state to 1 (turn LED on)
            } else {
                LED.writeSync(0); //set pin state to 0 (turn LED off)
            }
        }

        pubnub.addListener({
            status: function (statusEvent) {
                console.log('PN status event:', JSON.stringify(statusEvent));
            },
            message: function (messageEvent) {

                console.log('PN message event:', JSON.stringify(messageEvent));

                const run = pipe(
                    BlinkMessage.decode(messageEvent.message),
                    E.fold(
                        log,
                        () => () => {

                            const blinkInterval = setInterval(blinkLED, 250); //run the blinkLED function every 250ms
            
                            setTimeout(endBlink, 500 * messageEvent.message.numBlinks); //stop blinking after 5 seconds
                            
                            function endBlink() { //function to stop blinking
                                clearInterval(blinkInterval); // Stop blink intervals
                                LED.writeSync(0); // Turn LED off
                            }

                        },
                    ),
                );

                run();

            },
            presence: function (presenceEvent) {
                console.log('PN presence event:', JSON.stringify(presenceEvent));
            },
        });

        pubnub.subscribe({
            channels: ['test'],
        });

    });

const program = sequenceT(T.taskSeq)(
    pipe(
        T.fromIO(log('checking wifi connection')),
        T.chain(() => checkWifiConnection),
        T.map(Number),
        T.chain((code) => code === 0
            ? T.fromIO(log('a wifi connection exists'))
            : pipe(
                T.fromIO(log('a wifi connection does not exist, starting wifi connect')),
                T.chain(() => startWifiConnect),
                T.map(Number),
                T.chain((code) => code === 0
                    ? T.fromIO(log('wifi connection established'))
                    : T.fromIO(log('wifi connection not established')),
                ),
            ),
        ),
    ),
    listen,
    T.fromIO(log('program complete')),
);

program().then(
    console.log,
    console.warn,
);
