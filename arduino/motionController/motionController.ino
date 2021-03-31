#include <Wire.h>
#include "ITG3200.h"
#define TIMEMS 80
#define DELAYuS 60
void reset_gyro(float, float, float);

void ledshit(bool light);
float vx[TIMEMS], vy[TIMEMS], vz[TIMEMS], sumx = 0, sumy = 0, anglex, angley;
int i = 0, looped = 0, int_anglex, int_angley, tempy, tempx;

ITG3200 gyro;
void setup()
{
	Serial.begin(9600);
	pinMode(2, INPUT_PULLUP);
	pinMode(5, OUTPUT);
	pinMode(6, OUTPUT);
	TCCR0B = TCCR0B & B11111000 | B00000001;
	const int buttonPin = 2;
	gyro.init();
	gyro.zeroCalibrate(200, 10); //sample 200 times to calibrate and it will take 200*10ms
	attachInterrupt(digitalPinToInterrupt(buttonPin), nollstall, FALLING);
}

void loop()
{
	//handsken i denna funktion
	gyro.getAngularVelocity((vx + i), (vy + i), (vz + i));
	if (vx[i] < -1 || vx[i] > 1)
		sumx += vx[i];
	if (vy[i] < -1 || vy[i] > 1)
		sumy += vy[i];
	if (i++ == TIMEMS)
		i = 0;
	_delay_us(DELAYuS);
	anglex = sumx * TIMEMS * 1 * (DELAYuS * 0.000001);
	angley = sumy * TIMEMS * 1 * (DELAYuS * 0.000001);
	int_anglex = anglex;
	int_angley = angley;
	if (int_anglex / 360 != 0 || int_angley / 360 != 0)
	{
		while (int_anglex < -360)
			int_anglex = -360;
		while (int_anglex > 360)
			int_anglex = 360;
		while (int_angley < -360)
			int_angley = -360;
		while (int_angley > 360)
			int_angley = 360;
	}
	int_anglex = int_anglex * 0.5 + 132;
	int_angley = -int_angley * 1.1 + 132;
	tempy = int_angley;
	if (tempy > 255)
		tempy = 255;
	if (tempy < 0)
		tempy = 0;
	tempx = int_anglex;
	if (tempx > 255)
		tempx = 255;
	if (tempx < 0)
		tempx = 0;

	analogWrite(5, ((int_anglex / 4) + 96));
	analogWrite(6, int_angley);
}

void ledshit(bool light)
{
	digitalWrite(13, (light ? HIGH : LOW));
}

void nollstall()
{
	ledshit(1);
	Serial.println("Vi kör interrruuuuuuupt!");
	sumx = 0;
	sumy = 0;
	ledshit(0);
}
