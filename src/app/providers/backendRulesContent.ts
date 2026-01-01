/**
 * App layer - полный контент правил разработки Backend
 * Автоматически сгенерировано из DEVELOPMENT_RULES (B).md
 */
export const BACKEND_RULES_CONTENT = `# Правила разработки Backend

> **ВАЖНО:** Этот документ является обязательным руководством для всей backend разработки. Каждая строка кода должна соответствовать этим правилам.

---

## Главные принципы

### 1. Бэкенд - ЕДИНСТВЕННЫЙ источник истины

**⚠️ КРИТИЧЕСКИ ВАЖНО:**
- ✅ Вся бизнес-логика ТОЛЬКО на бэкенде
- ✅ Все правила валидации на бэкенде
- ✅ Все расчеты на бэкенде
- ✅ Фронтенд не принимает бизнес-решений
- ❌ НЕ доверяем данным от фронтенда без валидации
- ❌ НЕ пропускаем шаги авторизации/проверки прав
- ❌ НЕ храним секреты в коде

**Примеры:**
\`\`\`typescript
// ✅ ПРАВИЛЬНО - проверка прав на бэкенде
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN, UserRole.REALTOR)
async updateProperty(@Param('id') id: string, @Body() dto: UpdatePropertyDto) {
  return this.propertyService.update(id, dto);
}

// ❌ НЕПРАВИЛЬНО - доверяем фронтенду
async updateProperty(@Body() dto: any) {
  // если dto.canEdit === true, то обновляем
  if (dto.canEdit) { // ❌ фронтенд может подделать!
    return this.propertyService.update(dto.id, dto);
  }
}
\`\`\`

### 2. Строгая архитектура NestJS

**Структура модуля:**
\`\`\`
module/
├── dto/
│   ├── create-entity.dto.ts
│   ├── update-entity.dto.ts
│   └── query-entity.dto.ts
├── entities/
│   └── entity.entity.ts
├── guards/
│   └── entity-owner.guard.ts
├── entity.controller.ts
├── entity.service.ts
├── entity.module.ts
└── entity.repository.ts (опционально)
\`\`\`

**Правило:** Каждый модуль независим и самодостаточен.

### 3. Принцип единой ответственности (SRP)

**Каждый класс делает ОДНУ вещь:**
- **Controller** - принимает HTTP запросы, валидирует, возвращает ответы
- **Service** - бизнес-логика
- **Repository** - работа с БД (если нужен дополнительный слой поверх Prisma)
- **Guard** - проверка доступа
- **Interceptor** - трансформация данных
- **Pipe** - валидация и преобразование

---

## Архитектурные правила

### Правило 1: Контроллер - тонкий слой

\`\`\`typescript
// ❌ НЕПРАВИЛЬНО - бизнес-логика в контроллере
@Controller('properties')
export class PropertyController {
  @Post()
  async create(@Body() dto: CreatePropertyDto, @CurrentUser() user: User) {
    // ❌ логика в контроллере!
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const property = await this.prisma.property.create({
      data: { ...dto, userId: user.id },
    });
    // еще 50 строк логики...
    return property;
  }
}

// ✅ ПРАВИЛЬНО - контроллер только маршрутизация
@Controller('properties')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.REALTOR, UserRole.DEVELOPER)
  @ApiOperation({ summary: 'Create property' })
  @ApiResponse({ status: 201, type: Property })
  async create(
    @Body() dto: CreatePropertyDto,
    @CurrentUser() user: User,
  ): Promise<Property> {
    return this.propertyService.create(dto, user.id);
  }
}
\`\`\`

### Правило 2: Сервис - вся бизнес-логика

\`\`\`typescript
// ✅ ПРАВИЛЬНО - логика в сервисе
@Injectable()
export class PropertyService {
  constructor(private readonly prisma: PrismaService) {}

  async create(dto: CreatePropertyDto, userId: string): Promise<Property> {
    // Проверки
    await this.validatePropertyData(dto);
    
    // Бизнес-логика
    const calculatedPrice = this.calculatePrice(dto);
    
    // Создание
    const property = await this.prisma.property.create({
      data: {
        ...dto,
        price: calculatedPrice,
        userId,
        status: PropertyStatus.DRAFT,
      },
      include: {
        user: true,
        images: true,
      },
    });
    
    // Побочные эффекты
    await this.notificationService.notifyNewProperty(property);
    
    return property;
  }

  private calculatePrice(dto: CreatePropertyDto): number {
    // сложные расчеты
    return dto.basePrice * dto.area * this.priceCoefficient;
  }

  private async validatePropertyData(dto: CreatePropertyDto): Promise<void> {
    // дополнительные проверки бизнес-правил
    if (dto.area < 10) {
      throw new BadRequestException('Area must be at least 10 sq.m');
    }
  }
}
\`\`\`

### Правило 3: Dependency Injection

\`\`\`typescript
// ✅ ПРАВИЛЬНО - используем DI
@Injectable()
export class PropertyService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly userService: UserService,
    private readonly mailService: MailService,
    private readonly configService: ConfigService,
  ) {}
}

// ❌ НЕПРАВИЛЬНО - прямое создание экземпляров
@Injectable()
export class PropertyService {
  private prisma = new PrismaService(); // ❌
  private userService = new UserService(); // ❌
}
\`\`\`

---

## Структура проекта

### Модули - организация кода

\`\`\`
src/
├── app.module.ts              # Корневой модуль
├── main.ts                    # Entry point
│
├── config/                    # Конфигурация
│   ├── database.config.ts
│   ├── jwt.config.ts
│   ├── redis.config.ts
│   └── mail.config.ts
│
├── common/                    # Общие ресурсы
│   ├── decorators/
│   │   ├── current-user.decorator.ts
│   │   └── roles.decorator.ts
│   ├── guards/
│   │   ├── jwt-auth.guard.ts
│   │   └── roles.guard.ts
│   ├── interceptors/
│   │   ├── logging.interceptor.ts
│   │   └── transform.interceptor.ts
│   ├── filters/
│   │   └── all-exceptions.filter.ts
│   ├── pipes/
│   │   └── validation.pipe.ts
│   └── interfaces/
│       └── response.interface.ts
│
├── database/                  # Prisma
│   ├── database.module.ts
│   └── prisma.service.ts
│
├── auth/                      # Модуль аутентификации
│   ├── dto/
│   ├── strategies/
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   └── auth.module.ts
│
├── users/                     # Модуль пользователей
│   ├── dto/
│   ├── entities/
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── users.module.ts
│
└── properties/                # Модуль недвижимости
    ├── dto/
    ├── entities/
    ├── properties.controller.ts
    ├── properties.service.ts
    └── properties.module.ts
\`\`\`

---

## Валидация - обязательные правила

### Правило 1: DTO с class-validator

\`\`\`typescript
// ✅ ПРАВИЛЬНО - полная валидация
import { IsString, IsEmail, IsEnum, MinLength, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateUserDto {
  @ApiProperty({ example: 'user@example.com' })
  @IsEmail({}, { message: 'Invalid email format' })
  email: string;

  @ApiProperty({ minLength: 6 })
  @IsString()
  @MinLength(6, { message: 'Password must be at least 6 characters' })
  password: string;

  @ApiProperty({ enum: UserRole })
  @IsEnum(UserRole, { message: 'Invalid role' })
  role: UserRole;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsString()
  firstName?: string;
}

// ❌ НЕПРАВИЛЬНО - нет валидации
export class CreateUserDto {
  email: string;
  password: string;
  role: string;
}
\`\`\`

### Правило 2: Валидация на уровне приложения

\`\`\`typescript
// main.ts
app.useGlobalPipes(
  new ValidationPipe({
    whitelist: true,              // удаляет свойства не в DTO
    forbidNonWhitelisted: true,   // выбрасывает ошибку на лишние свойства
    transform: true,              // автоматическое преобразование типов
    transformOptions: {
      enableImplicitConversion: true,
    },
  }),
);
\`\`\`

### Правило 3: Кастомная валидация

\`\`\`typescript
// ✅ ПРАВИЛЬНО - кастомный валидатор
import { registerDecorator, ValidationOptions, ValidationArguments } from 'class-validator';

export function IsStrongPassword(validationOptions?: ValidationOptions) {
  return function (object: Object, propertyName: string) {
    registerDecorator({
      name: 'isStrongPassword',
      target: object.constructor,
      propertyName: propertyName,
      options: validationOptions,
      validator: {
        validate(value: any, args: ValidationArguments) {
          const regex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\\d)(?=.*[@\$!%*?&])[A-Za-z\\d@\$!%*?&]{8,}\$/;
          return typeof value === 'string' && regex.test(value);
        },
        defaultMessage(args: ValidationArguments) {
          return 'Password must contain uppercase, lowercase, number and special character';
        },
      },
    });
  };
}

// Использование
export class CreateUserDto {
  @IsStrongPassword()
  password: string;
}
\`\`\`

---

## 🔐 Безопасность - критичные правила

### 1. Хеширование паролей

\`\`\`typescript
// ✅ ПРАВИЛЬНО
import * as bcrypt from 'bcrypt';

async register(dto: RegisterDto) {
  const hashedPassword = await bcrypt.hash(dto.password, 10);
  
  return this.prisma.user.create({
    data: {
      email: dto.email,
      password: hashedPassword, // ✅ хешированный пароль
    },
  });
}

// ❌ НЕПРАВИЛЬНО - пароль в открытом виде
async register(dto: RegisterDto) {
  return this.prisma.user.create({
    data: {
      email: dto.email,
      password: dto.password, // ❌ plain text!
    },
  });
}
\`\`\`

### 2. JWT токены

\`\`\`typescript
// ✅ ПРАВИЛЬНО - с expiration
const accessToken = this.jwtService.sign(
  { sub: user.id, email: user.email, role: user.role },
  { expiresIn: '15m' }, // короткий срок для access token
);

const refreshToken = this.jwtService.sign(
  { sub: user.id },
  { expiresIn: '7d' }, // длинный для refresh token
);

// Сохраняем refresh token в БД
await this.prisma.refreshToken.create({
  data: {
    token: refreshToken,
    userId: user.id,
    expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000),
  },
});
\`\`\`

### 3. Guards для защиты эндпоинтов

\`\`\`typescript
// ✅ ПРАВИЛЬНО - защищенный эндпоинт
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.ADMIN)
@Delete(':id')
async delete(@Param('id') id: string) {
  return this.userService.delete(id);
}

// ❌ НЕПРАВИЛЬНО - нет защиты
@Delete(':id')
async delete(@Param('id') id: string) {
  return this.userService.delete(id);
}
\`\`\`

### 4. Sanitization входных данных

\`\`\`typescript
// ✅ ПРАВИЛЬНО - очистка HTML
import * as sanitizeHtml from 'sanitize-html';

@Post()
async create(@Body() dto: CreatePropertyDto) {
  const sanitizedDescription = sanitizeHtml(dto.description, {
    allowedTags: ['b', 'i', 'em', 'strong', 'p'],
    allowedAttributes: {},
  });
  
  return this.propertyService.create({
    ...dto,
    description: sanitizedDescription,
  });
}
\`\`\`

### 5. Rate Limiting

\`\`\`typescript
// app.module.ts
@Module({
  imports: [
    ThrottlerModule.forRoot([{
      ttl: 60000,      // 1 минута
      limit: 10,       // 10 запросов
    }]),
  ],
})

// controller
@UseGuards(ThrottlerGuard)
@Post('login')
async login(@Body() dto: LoginDto) {
  return this.authService.login(dto);
}
\`\`\`

### 6. CORS настройка

\`\`\`typescript
// main.ts
app.enableCors({
  origin: process.env.FRONTEND_URL, // ✅ конкретный домен
  // origin: '*', // ❌ небезопасно для production
  credentials: true,
  methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  allowedHeaders: 'Content-Type,Authorization',
});
\`\`\`

### 7. Helmet для безопасности заголовков

\`\`\`typescript
// main.ts
import * as helmet from 'helmet';

app.use(helmet());
\`\`\`

---

## Работа с БД (Prisma)

### Правило 1: Типизация через Prisma

\`\`\`typescript
// ✅ ПРАВИЛЬНО - используем типы Prisma
import { User, Property, Prisma } from '@prisma/client';

async findById(id: string): Promise<User> {
  return this.prisma.user.findUnique({
    where: { id },
    include: {
      profile: true,
      properties: true,
    },
  });
}

// Используем Prisma типы для select
type UserWithProfile = Prisma.UserGetPayload<{
  include: { profile: true };
}>;
\`\`\`

### Правило 2: Транзакции для связанных операций

\`\`\`typescript
// ✅ ПРАВИЛЬНО - транзакция
async createPropertyWithImages(dto: CreatePropertyDto, images: string[]) {
  return this.prisma.\$transaction(async (tx) => {
    const property = await tx.property.create({
      data: {
        title: dto.title,
        price: dto.price,
        userId: dto.userId,
      },
    });

    await tx.propertyImage.createMany({
      data: images.map(url => ({
        url,
        propertyId: property.id,
      })),
    });

    return property;
  });
}

// ❌ НЕПРАВИЛЬНО - отдельные операции (может быть race condition)
async createPropertyWithImages(dto: CreatePropertyDto, images: string[]) {
  const property = await this.prisma.property.create({ data: dto });
  
  await this.prisma.propertyImage.createMany({
    data: images.map(url => ({ url, propertyId: property.id })),
  });
  
  return property;
}
\`\`\`

### Правило 3: Пагинация

\`\`\`typescript
// ✅ ПРАВИЛЬНО - cursor-based пагинация
async findAll(query: QueryPropertyDto) {
  const { cursor, take = 20 } = query;
  
  return this.prisma.property.findMany({
    take: take + 1, // берем на 1 больше для hasNextPage
    ...(cursor && {
      skip: 1,
      cursor: { id: cursor },
    }),
    orderBy: { createdAt: 'desc' },
  });
}

// ✅ ПРАВИЛЬНО - offset-based пагинация
async findAll(query: QueryPropertyDto) {
  const { page = 1, limit = 20 } = query;
  const skip = (page - 1) * limit;
  
  const [data, total] = await Promise.all([
    this.prisma.property.findMany({
      skip,
      take: limit,
      orderBy: { createdAt: 'desc' },
    }),
    this.prisma.property.count(),
  ]);
  
  return {
    data,
    meta: {
      total,
      page,
      limit,
      totalPages: Math.ceil(total / limit),
    },
  };
}
\`\`\`

### Правило 4: Soft Delete

\`\`\`typescript
// schema.prisma
model User {
  id        String    @id @default(uuid())
  email     String    @unique
  deletedAt DateTime? // soft delete
}

// ✅ ПРАВИЛЬНО
async softDelete(id: string): Promise<void> {
  await this.prisma.user.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}

// Middleware для фильтрации удаленных
this.prisma.\$use(async (params, next) => {
  if (params.model === 'User') {
    if (params.action === 'findUnique' || params.action === 'findFirst') {
      params.action = 'findFirst';
      params.args.where['deletedAt'] = null;
    }
    if (params.action === 'findMany') {
      if (params.args.where) {
        params.args.where['deletedAt'] = null;
      } else {
        params.args['where'] = { deletedAt: null };
      }
    }
  }
  return next(params);
});
\`\`\`

### Правило 5: N+1 проблема - используем include/select

\`\`\`typescript
// ❌ НЕПРАВИЛЬНО - N+1 проблема
async getUsersWithProperties() {
  const users = await this.prisma.user.findMany();
  
  for (const user of users) {
    user.properties = await this.prisma.property.findMany({
      where: { userId: user.id }, // N запросов!
    });
  }
  
  return users;
}

// ✅ ПРАВИЛЬНО - один запрос с include
async getUsersWithProperties() {
  return this.prisma.user.findMany({
    include: {
      properties: true,
    },
  });
}
\`\`\`

---

## Обработка ошибок

### Правило 1: HTTP исключения

\`\`\`typescript
import { 
  BadRequestException, 
  NotFoundException, 
  UnauthorizedException,
  ForbiddenException,
  ConflictException,
} from '@nestjs/common';

// ✅ ПРАВИЛЬНО
async findById(id: string): Promise<User> {
  const user = await this.prisma.user.findUnique({ where: { id } });
  
  if (!user) {
    throw new NotFoundException(\`User with ID \${id} not found\`);
  }
  
  return user;
}

async create(dto: CreateUserDto): Promise<User> {
  try {
    return await this.prisma.user.create({ data: dto });
  } catch (error) {
    if (error.code === 'P2002') { // Unique constraint
      throw new ConflictException('Email already exists');
    }
    throw error;
  }
}
\`\`\`

### Правило 2: Глобальный фильтр исключений

\`\`\`typescript
// common/filters/all-exceptions.filter.ts
@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    let status = HttpStatus.INTERNAL_SERVER_ERROR;
    let message = 'Internal server error';

    if (exception instanceof HttpException) {
      status = exception.getStatus();
      message = exception.message;
    }

    const errorResponse = {
      statusCode: status,
      timestamp: new Date().toISOString(),
      path: request.url,
      message,
    };

    this.logger.error(
      \`\${request.method} \${request.url}\`,
      JSON.stringify(errorResponse),
      'AllExceptionsFilter',
    );

    response.status(status).json(errorResponse);
  }
}
\`\`\`

### Правило 3: Кастомные исключения

\`\`\`typescript
// common/exceptions/business.exception.ts
export class InsufficientBalanceException extends BadRequestException {
  constructor() {
    super('Insufficient balance for this operation');
  }
}

export class PropertyNotAvailableException extends BadRequestException {
  constructor(propertyId: string) {
    super(\`Property \${propertyId} is not available\`);
  }
}

// Использование
if (user.balance < property.price) {
  throw new InsufficientBalanceException();
}
\`\`\`

---

## Swagger документация

### Правило 1: Документируем всё

\`\`\`typescript
@ApiTags('properties')
@Controller('properties')
export class PropertyController {
  @Post()
  @ApiOperation({ summary: 'Create a new property' })
  @ApiResponse({ 
    status: 201, 
    description: 'Property successfully created',
    type: Property,
  })
  @ApiResponse({ 
    status: 400, 
    description: 'Bad request - validation failed',
  })
  @ApiResponse({ 
    status: 401, 
    description: 'Unauthorized',
  })
  @ApiBearerAuth()
  async create(@Body() dto: CreatePropertyDto): Promise<Property> {
    return this.propertyService.create(dto);
  }
}
\`\`\`

### Правило 2: DTO с примерами

\`\`\`typescript
export class CreatePropertyDto {
  @ApiProperty({ 
    example: 'Luxury apartment in city center',
    description: 'Property title',
  })
  @IsString()
  title: string;

  @ApiProperty({ 
    example: 1500000,
    description: 'Price in rubles',
    minimum: 0,
  })
  @IsNumber()
  @Min(0)
  price: number;

  @ApiProperty({
    example: 75.5,
    description: 'Area in square meters',
  })
  @IsNumber()
  @Min(1)
  area: number;
}
\`\`\`

---

## 🧪 Тестирование

### Unit тесты для сервисов

\`\`\`typescript
// property.service.spec.ts
describe('PropertyService', () => {
  let service: PropertyService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PropertyService,
        {
          provide: PrismaService,
          useValue: {
            property: {
              create: jest.fn(),
              findUnique: jest.fn(),
              findMany: jest.fn(),
              update: jest.fn(),
              delete: jest.fn(),
            },
          },
        },
      ],
    }).compile();

    service = module.get<PropertyService>(PropertyService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  describe('create', () => {
    it('should create a property', async () => {
      const dto = {
        title: 'Test Property',
        price: 1000000,
        area: 50,
      };
      
      const expected = { id: '1', ...dto };
      
      jest.spyOn(prisma.property, 'create').mockResolvedValue(expected);
      
      const result = await service.create(dto, 'user-id');
      
      expect(result).toEqual(expected);
      expect(prisma.property.create).toHaveBeenCalledWith({
        data: expect.objectContaining(dto),
      });
    });
  });
});
\`\`\`

### E2E тесты для контроллеров

\`\`\`typescript
// property.controller.e2e-spec.ts
describe('PropertyController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/properties (POST)', () => {
    return request(app.getHttpServer())
      .post('/properties')
      .send({
        title: 'Test Property',
        price: 1000000,
        area: 50,
      })
      .expect(201)
      .expect((res) => {
        expect(res.body).toHaveProperty('id');
        expect(res.body.title).toBe('Test Property');
      });
  });
});
\`\`\`

---

## Performance оптимизация

### 1. Кэширование с Redis

\`\`\`typescript
@Injectable()
export class PropertyService {
  constructor(
    private readonly prisma: PrismaService,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  async findById(id: string): Promise<Property> {
    // Проверяем кэш
    const cached = await this.redis.get(\`property:\${id}\`);
    if (cached) {
      return JSON.parse(cached);
    }

    // Запрос к БД
    const property = await this.prisma.property.findUnique({
      where: { id },
    });

    if (!property) {
      throw new NotFoundException();
    }

    // Сохраняем в кэш на 5 минут
    await this.redis.setex(\`property:\${id}\`, 300, JSON.stringify(property));

    return property;
  }

  async update(id: string, dto: UpdatePropertyDto): Promise<Property> {
    const property = await this.prisma.property.update({
      where: { id },
      data: dto,
    });

    // Инвалидируем кэш
    await this.redis.del(\`property:\${id}\`);

    return property;
  }
}
\`\`\`

### 2. Database индексы

\`\`\`prisma
// schema.prisma
model Property {
  id        String   @id @default(uuid())
  title     String
  price     Int
  area      Float
  userId    String
  createdAt DateTime @default(now())

  user User @relation(fields: [userId], references: [id])

  @@index([userId])           // индекс для поиска по пользователю
  @@index([price])            // индекс для сортировки по цене
  @@index([createdAt])        // индекс для сортировки по дате
  @@index([userId, createdAt]) // композитный индекс
}
\`\`\`

### 3. Batch операции

\`\`\`typescript
// ✅ ПРАВИЛЬНО - batch операции
async createMany(dtos: CreatePropertyDto[]): Promise<void> {
  await this.prisma.property.createMany({
    data: dtos,
    skipDuplicates: true,
  });
}

// ❌ НЕПРАВИЛЬНО - по одному
async createMany(dtos: CreatePropertyDto[]): Promise<void> {
  for (const dto of dtos) {
    await this.prisma.property.create({ data: dto });
  }
}
\`\`\`

### 4. Lazy loading связей

\`\`\`typescript
// ✅ ПРАВИЛЬНО - загружаем только нужное
async findAll(includeUser?: boolean) {
  return this.prisma.property.findMany({
    ...(includeUser && { include: { user: true } }),
  });
}
\`\`\`

### 5. Connection pooling

\`\`\`typescript
// prisma.config.ts
datasource: {
  url: \`\${process.env.DATABASE_URL}?connection_limit=10&pool_timeout=20\`,
}
\`\`\`

---

## 📋 Чек-лист нового эндпоинта

Когда создаешь новый эндпоинт:

1. [ ] DTO с полной валидацией (class-validator)
2. [ ] Swagger документация (@ApiOperation, @ApiResponse)
3. [ ] Guards для проверки прав (@UseGuards)
4. [ ] Обработка ошибок (try-catch, HttpException)
5. [ ] Типизация ответа (Promise<Entity>)
6. [ ] Бизнес-логика в Service, не в Controller
7. [ ] Проверка существования entity (NotFoundException)
8. [ ] Транзакции для связанных операций
9. [ ] Тесты (unit + e2e)
10. [ ] Rate limiting для чувствительных эндпоинтов

---

## 🎓 Принципы SOLID для NestJS

### S - Single Responsibility
Сервис отвечает за одну сущность

### O - Open/Closed
Расширяем через DI, не меняя код

### L - Liskov Substitution
Интерфейсы должны быть взаимозаменяемы

### I - Interface Segregation
Не заставляем зависеть от неиспользуемых методов

### D - Dependency Inversion
Зависим от абстракций (interfaces), не от конкретных классов

---

## Антипаттерны - чего избегать

### 1. Бизнес-логика в контроллере

\`\`\`typescript
// ❌ НЕПРАВИЛЬНО
@Post()
async create(@Body() dto: CreatePropertyDto) {
  const price = dto.basePrice * dto.area * 1.2;
  return this.prisma.property.create({ data: { ...dto, price } });
}

// ✅ ПРАВИЛЬНО
@Post()
async create(@Body() dto: CreatePropertyDto) {
  return this.propertyService.create(dto);
}
\`\`\`

### 2. Прямой доступ к Prisma из контроллера

\`\`\`typescript
// ❌ НЕПРАВИЛЬНО
@Controller('properties')
export class PropertyController {
  constructor(private readonly prisma: PrismaService) {}
  
  @Get()
  async findAll() {
    return this.prisma.property.findMany();
  }
}

// ✅ ПРАВИЛЬНО
@Controller('properties')
export class PropertyController {
  constructor(private readonly propertyService: PropertyService) {}
  
  @Get()
  async findAll() {
    return this.propertyService.findAll();
  }
}
\`\`\`

### 3. Не валидировать данные

\`\`\`typescript
// ❌ НЕПРАВИЛЬНО
@Post()
async create(@Body() dto: any) { // any!
  return this.propertyService.create(dto);
}

// ✅ ПРАВИЛЬНО
@Post()
async create(@Body() dto: CreatePropertyDto) { // типизированный DTO
  return this.propertyService.create(dto);
}
\`\`\`

### 4. Утечка паролей в ответах

\`\`\`typescript
// ❌ НЕПРАВИЛЬНО
async findById(id: string): Promise<User> {
  return this.prisma.user.findUnique({ where: { id } });
  // вернется с паролем!
}

// ✅ ПРАВИЛЬНО
async findById(id: string): Promise<User> {
  return this.prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      email: true,
      role: true,
      // password НЕ включаем
    },
  });
}

// ✅ ИЛИ используем Exclude в entity
import { Exclude } from 'class-transformer';

export class User {
  id: string;
  email: string;
  
  @Exclude()
  password: string;
}

// В контроллере
@UseInterceptors(ClassSerializerInterceptor)
@Get(':id')
async findOne(@Param('id') id: string) {
  return this.userService.findOne(id);
}
\`\`\`

---

## 📚 Итоговые правила (краткая версия)

1. **Бэкенд - источник истины**
2. **Вся бизнес-логика в Services**
3. **Controllers - только маршрутизация**
4. **DTO с полной валидацией**
5. **Guards для всех защищенных роутов**
6. **Swagger документация обязательна**
7. **Обработка всех ошибок**
8. **Типизация через Prisma**
9. **Транзакции для связанных операций**
10. **Хеширование паролей (bcrypt)**
11. **JWT с коротким expiration**
12. **Rate limiting**
13. **Тесты (unit + e2e)**
14. **Dependency Injection**
15. **SOLID принципы**

---

**Эти правила ОБЯЗАТЕЛЬНЫ для всей backend разработки!**

При каждом новом эндпоинте/модуле - проверяй соответствие этому документу.

`;
