import { Global, Module } from '@nestjs/common';
import { RedisModule as NestRedisModule } from '@nestjs-modules/ioredis';

@Global()
@Module({
    imports: [
        NestRedisModule.forRoot({
            type: 'single',
            options: {
                host: 'localhost',
                port: 6379,
            },
        }),
    ],
})
export class RedisModule { }
