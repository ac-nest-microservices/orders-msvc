import 'dotenv/config';
import * as joi from 'joi';

type EnvVars = {
  PORT: number;
  NATS_SERVERS: string[];
};

const envVarsSchema = joi
  .object({
    PORT: joi.number().required(),
    NATS_SERVERS: joi.array().items(joi.string()).required(),
  })
  .unknown(true);

const { error, value } = envVarsSchema.validate({
  ...process.env,
  NATS_SERVERS: process.env.NATS_SERVERS?.split(','),
});

if (error) {
  throw new Error(`Config validation error: ${error.message}`);
}

const envVars: EnvVars = value;

export const config = {
  port: envVars.PORT,
  natsServers: envVars.NATS_SERVERS,
};
