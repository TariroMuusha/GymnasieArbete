void setup()
{
	Serial.begin(9600);
	pinMode(5, OUTPUT);
	pinMode(6, OUTPUT);
	TCCR0B = TCCR0B & B11111000 | B00000001;
}

long value = 0x7f7f;
void loop()
{
	if (Serial.available() && Serial.peek() != -1)
	{
		/*
		 * The string being read and parsed represents a 16 bit unsigned integer as UTF8
		 * The first byte represent throttle speed
		 * The next byte (mask 0xff00) represents steering
		*/
		value = Serial.parseInt();
	}
	analogWrite(5, value & 255);
	analogWrite(6, (value >> 8));
}
