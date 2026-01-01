/**
 * App layer - полный контент правил разработки
 * Автоматически сгенерировано из DEVELOPMENT_RULES.md
 */
export const FULL_RULES_CONTENT = `# Правила разработки Frontend

> **ВАЖНО:** Этот документ является обязательным руководством для всей frontend разработки. Каждая строка кода должна соответствовать этим правилам.

---

## Главные принципы

### 1. Источник истины - ТОЛЬКО БЭКЕНД

**⚠️ КРИТИЧЕСКИ ВАЖНО:**
- ✅ Все данные приходят с бэкенда
- ✅ Все бизнес-правила определяются бэкендом
- ✅ Фронтенд - это только UI представление данных бэкенда
- ❌ НЕ дублировать бизнес-логику на фронтенде
- ❌ НЕ хранить критичные данные только на фронтенде
- ❌ НЕ принимать решения, которые должен принимать бэкенд

**Примеры:**
\`\`\`typescript
// ❌ НЕПРАВИЛЬНО - дублирование бизнес-логики
const canEditProperty = user.role === 'ADMIN' || user.role === 'REALTOR';

// ✅ ПРАВИЛЬНО - спрашиваем у бэкенда
const { data: permissions } = useGetUserPermissionsQuery();
const canEditProperty = permissions?.canEditProperty;
\`\`\`

### 2. Строгое следование FSD (Feature-Sliced Design)

**Структура слоев (снизу вверх):**
\`\`\`
shared → entities → features → widgets → pages → app
\`\`\`

**Правила импортов:**
- ✅ Слой может импортировать только из слоев НИЖЕ
- ❌ Слой НЕ может импортировать из слоев ВЫШЕ
- ❌ Модули внутри одного слоя НЕ зависят друг от друга

### 3. Декомпозиция и переиспользование

**Принцип:** Если код повторяется 2+ раза - выносим в отдельный модуль.

---

## Архитектурные правила

### Правило 1: Single Responsibility Principle (SRP)

**Каждый модуль делает ОДНУ вещь:**

\`\`\`typescript
// ❌ НЕПРАВИЛЬНО - слишком много ответственности
const UserProfile = () => {
  const [user, setUser] = useState();
  const [isEditing, setIsEditing] = useState(false);
  
  const handleEdit = () => { /* ... */ };
  const handleSave = () => { /* ... */ };
  const handleUploadAvatar = () => { /* ... */ };
  
  return (
    <div>
      {/* 300+ строк JSX */}
    </div>
  );
};

// ✅ ПРАВИЛЬНО - разбито на отдельные компоненты
const UserProfile = () => {
  const { data: user } = useGetUserQuery();
  
  return (
    <div>
      <UserHeader user={user} />
      <UserAvatar user={user} />
      <UserInfo user={user} />
      <UserEditForm user={user} />
    </div>
  );
};
\`\`\`

### Правило 2: DRY (Don't Repeat Yourself)

**Повторяющийся код выносим:**

\`\`\`typescript
// ❌ НЕПРАВИЛЬНО - повторение
const PropertyCard = () => (
  <div className="rounded-lg shadow-md p-4 bg-white">...</div>
);

const UserCard = () => (
  <div className="rounded-lg shadow-md p-4 bg-white">...</div>
);

// ✅ ПРАВИЛЬНО - переиспользуемый компонент
// shared/ui/card/Card.tsx
export const Card = ({ children }: Props) => (
  <div className="rounded-lg shadow-md p-4 bg-white">
    {children}
  </div>
);

// Использование
const PropertyCard = () => (
  <Card>...</Card>
);
\`\`\`

### Правило 3: Разделение UI и бизнес-логики

\`\`\`typescript
// ❌ НЕПРАВИЛЬНО - все в одном компоненте
const LoginForm = () => {
  const [email, setEmail] = useState('');
  const [login] = useLoginMutation();
  
  const handleSubmit = async () => {
    try {
      await login({ email }).unwrap();
      // валидация, обработка ошибок...
    } catch {}
  };
  
  return <form>...</form>;
};

// ✅ ПРАВИЛЬНО - логика в хуке, UI отдельно
// model/useLogin.ts
export const useLogin = () => {
  const [login, { isLoading }] = useLoginMutation();
  
  const handleLogin = async (data: LoginData) => {
    // вся логика здесь
  };
  
  return { handleLogin, isLoading };
};

// ui/LoginForm.tsx
export const LoginForm = () => {
  const { handleLogin, isLoading } = useLogin();
  
  return <form onSubmit={handleLogin}>...</form>;
};
\`\`\`

---

## FSD: Где что размещать

### Shared Layer - переиспользуемый код БЕЗ бизнес-логики

**Что размещаем:**
- ✅ UI Kit компоненты (Button, Input, Modal)
- ✅ Утилиты (formatDate, cn, validators)
- ✅ Хуки общего назначения (useDebounce, useLocalStorage)
- ✅ API клиент
- ✅ Константы
- ✅ Типы TypeScript (если не относятся к entities)

**Что НЕ размещаем:**
- ❌ Бизнес-логику
- ❌ Компоненты, специфичные для домена
- ❌ API endpoints (они в entities)

### Entities Layer - бизнес-сущности

**Что размещаем:**
- ✅ Типы сущностей (User, Property, Company)
- ✅ API endpoints для сущностей
- ✅ UI компоненты сущностей (UserCard, PropertyImage)
- ✅ Хелперы для работы с сущностями

**Структура:**
\`\`\`
entities/user/
├── model/
│   ├── types.ts          # interface User
│   └── userSlice.ts      # Redux slice (если нужен)
├── api/
│   └── userApi.ts        # RTK Query endpoints
├── ui/
│   ├── UserCard.tsx
│   └── UserAvatar.tsx
└── index.ts              # Public API
\`\`\`

**Правила:**
- ❌ Entities НЕ зависят друг от друга
- ❌ Entities НЕ содержат пользовательских сценариев

### Features Layer - пользовательские действия

**Что размещаем:**
- ✅ Формы (login-form, register-form)
- ✅ Действия пользователя (add-to-favorites, share-property)
- ✅ Фильтры, сортировки

**Структура:**
\`\`\`
features/auth/login-form/
├── ui/
│   └── LoginForm.tsx
├── model/
│   ├── useLogin.ts
│   └── loginSchema.ts    # Yup schema
└── index.ts
\`\`\`

**Правила:**
- ✅ Может использовать entities
- ❌ НЕ может использовать другие features
- ✅ Одна фича = одно действие пользователя

### Widgets Layer - композитные блоки

**Что размещаем:**
- ✅ Header, Footer
- ✅ Карточки (PropertyCard, которая использует фичи)
- ✅ Сложные блоки, собранные из features и entities

**Правила:**
- ✅ Может использовать features и entities
- ✅ Самодостаточные блоки

### Pages Layer - страницы

**Что размещаем:**
- ✅ Страницы приложения (по одной на роут)
- ✅ Композицию widgets, features, entities

**Правила:**
- ❌ Минимум бизнес-логики (только композиция)
- ✅ Может иметь свою модель для композиции данных

### App Layer - инициализация

**Что размещаем:**
- ✅ Провайдеры (Router, Redux, Theme)
- ✅ Глобальные стили
- ✅ Конфигурация

---

## State Management - когда что использовать

### RTK Query (приоритет) - для серверного состояния

**Используем для:**
- ✅ Данные с бэкенда (GET, POST, PUT, DELETE)
- ✅ Кэширование
- ✅ Автоматическая инвалидация

\`\`\`typescript
// entities/property/api/propertyApi.ts
export const propertyApi = api.injectEndpoints({
  endpoints: (builder) => ({
    getProperties: builder.query<Property[], void>({
      query: () => '/properties',
      providesTags: ['Property'],
    }),
    createProperty: builder.mutation<Property, CreatePropertyDto>({
      query: (data) => ({
        url: '/properties',
        method: 'POST',
        body: data,
      }),
      invalidatesTags: ['Property'],
    }),
  }),
});
\`\`\`

### Redux Toolkit - для клиентского состояния

**Используем для:**
- ✅ Глобальное UI состояние (theme, sidebar open/close)
- ✅ Состояние, которое нужно в разных частях приложения
- ✅ Сложные взаимодействия между модулями

\`\`\`typescript
// app/model/uiSlice.ts
export const uiSlice = createSlice({
  name: 'ui',
  initialState: {
    sidebarOpen: false,
    theme: 'light',
  },
  reducers: {
    toggleSidebar: (state) => {
      state.sidebarOpen = !state.sidebarOpen;
    },
  },
});
\`\`\`

### React State (useState) - для локального состояния

**Используем для:**
- ✅ Состояние, используемое только в одном компоненте
- ✅ UI состояние (открыт dropdown, текущий таб)

\`\`\`typescript
const Modal = () => {
  const [isOpen, setIsOpen] = useState(false); // ✅ Локально
  return <dialog open={isOpen}>...</dialog>;
};
\`\`\`

### Правило выбора:

1. **Данные с бэкенда?** → RTK Query
2. **Нужно в нескольких местах?** → Redux Toolkit
3. **Только в одном компоненте?** → useState

---

## UI компоненты - правила создания

### Правило 1: Атомарность

Создаем мелкие переиспользуемые компоненты:

\`\`\`typescript
// ✅ ПРАВИЛЬНО
<Button variant="primary" size="lg">
  <Icon name="plus" />
  <span>Добавить</span>
</Button>

// ❌ НЕПРАВИЛЬНО - все в одном
<button className="bg-blue-500 text-white px-4 py-2 rounded-lg flex items-center gap-2">
  <svg>...</svg>
  <span>Добавить</span>
</button>
\`\`\`

### Правило 2: Композиция вместо наследования

\`\`\`typescript
// ✅ ПРАВИЛЬНО - композиция
const PropertyCard = ({ property }: Props) => (
  <Card>
    <PropertyImage src={property.image} />
    <PropertyTitle>{property.title}</PropertyTitle>
    <PropertyPrice price={property.price} />
  </Card>
);

// ❌ НЕПРАВИЛЬНО - большой монолитный компонент
\`\`\`

### Правило 3: Props должны быть типизированы

\`\`\`typescript
// ✅ ПРАВИЛЬНО
interface ButtonProps {
  variant: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
  onClick?: () => void;
  children: ReactNode;
  disabled?: boolean;
  isLoading?: boolean;
}

export const Button = ({ variant, size = 'md', ... }: ButtonProps) => {
  // ...
};

// ❌ НЕПРАВИЛЬНО
export const Button = (props: any) => { // ❌ any запрещен!
\`\`\`

### Правило 4: Контролируемые компоненты для форм

\`\`\`typescript
// ✅ ПРАВИЛЬНО - React Hook Form
const { register, handleSubmit } = useForm();

<input {...register('email')} />

// ❌ НЕПРАВИЛЬНО - неконтролируемые
<input ref={emailRef} />
\`\`\`

---

## Формы - обязательные правила

### Используем React Hook Form + Yup

\`\`\`typescript
// ✅ ПРАВИЛЬНО
const loginSchema = yup.object({
  email: yup.string().email('Неверный email').required('Обязательно'),
  password: yup.string().min(6, 'Минимум 6 символов').required('Обязательно'),
});

const LoginForm = () => {
  const { register, handleSubmit, formState: { errors } } = useForm({
    resolver: yupResolver(loginSchema),
  });
  
  const onSubmit = (data: LoginData) => {
    // отправка на бэкенд
  };
  
  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Input {...register('email')} error={errors.email?.message} />
      <Input {...register('password')} error={errors.password?.message} />
      <Button type="submit">Войти</Button>
    </form>
  );
};
\`\`\`

**Правила:**
- ✅ Всегда валидация через Yup схемы
- ✅ Показываем ошибки пользователю
- ❌ НЕ дублируем валидацию с бэкенда (дополняем)

---

## API - работа с бэкендом

### Правило 1: Все через RTK Query

\`\`\`typescript
// ✅ ПРАВИЛЬНО
const { data, isLoading, error } = useGetPropertiesQuery();

// ❌ НЕПРАВИЛЬНО - прямые axios вызовы в компонентах
useEffect(() => {
  axios.get('/properties').then(...)
}, []);
\`\`\`

### Правило 2: Типы из Orval (автогенерация)

\`\`\`bash
# Генерируем типы из Swagger
npm run api:generate
\`\`\`

\`\`\`typescript
// ✅ ПРАВИЛЬНО - используем сгенерированные типы
import { Property, User } from '@/shared/api/generated';
\`\`\`

### Правило 3: Обработка ошибок

\`\`\`typescript
const { data, error, isError } = useGetPropertiesQuery();

if (isError) {
  return <ErrorMessage error={error} />;
}

// НЕ падаем без обработки ошибок!
\`\`\`

### Правило 4: Оптимистичные обновления (где уместно)

\`\`\`typescript
const [updateProperty] = useUpdatePropertyMutation();

const handleUpdate = async (data: UpdateData) => {
  try {
    await updateProperty(data).unwrap();
    // UI обновится автоматически через invalidation
  } catch (error) {
    // Показываем ошибку
  }
};
\`\`\`

---

## TypeScript - обязательные правила

### Запреты:

\`\`\`typescript
// ❌ ЗАПРЕЩЕНО
let data: any;                    // any запрещен!
let user: unknown;                // unknown без проверки типа
const props = {} as Props;        // type assertion без необходимости
// @ts-ignore                     // игнорирование ошибок TS

// ✅ ПРАВИЛЬНО
interface User {
  id: string;
  email: string;
}

const user: User = {
  id: '123',
  email: 'test@test.com',
};
\`\`\`

### Типизация всего:

\`\`\`typescript
// ✅ Функции
const formatPrice = (price: number): string => {
  return \`\${price}₽\`;
};

// ✅ Компоненты
interface CardProps {
  title: string;
  children: ReactNode;
}

export const Card = ({ title, children }: CardProps) => {
  // ...
};

// ✅ Хуки
const useUser = (id: string): { user: User | null; isLoading: boolean } => {
  // ...
};
\`\`\`

---

## 🧪 Тестирование (будущее)

### Что тестируем:

1. **Утилиты и хелперы** (shared/lib) - 100%
2. **Бизнес-логику** (model) - критичные части
3. **UI компоненты** - основные сценарии

\`\`\`typescript
// Пример
describe('formatPrice', () => {
  it('форматирует цену корректно', () => {
    expect(formatPrice(1000000)).toBe('1 000 000₽');
  });
});
\`\`\`

---

## 📐 Стилизация - правила Tailwind

### Правило 1: Используем Tailwind утилиты

\`\`\`typescript
// ✅ ПРАВИЛЬНО
<div className="flex items-center gap-4 p-4 rounded-lg shadow-md">

// ❌ НЕПРАВИЛЬНО - инлайн стили
<div style={{ display: 'flex', padding: '16px' }}>
\`\`\`

### Правило 2: Повторяющиеся стили → компонент

\`\`\`typescript
// ❌ НЕПРАВИЛЬНО - дублирование
<button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">
<button className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700">

// ✅ ПРАВИЛЬНО
<Button variant="primary">
\`\`\`

### Правило 3: Используем cn() для условных классов

\`\`\`typescript
import { cn } from '@/shared/lib/utils';

<div className={cn(
  'base-class',
  isActive && 'active-class',
  disabled && 'disabled-class'
)}>
\`\`\`

---

## 🔍 Code Review - чек-лист

Перед коммитом проверь:

- [ ] ✅ Следую FSD структуре
- [ ] ✅ Нет дублирования кода
- [ ] ✅ Компоненты атомарные
- [ ] ✅ Бизнес-логика отделена от UI
- [ ] ✅ Источник истины - бэкенд
- [ ] ✅ Все типизировано (нет \`any\`)
- [ ] ✅ Используется RTK Query для API
- [ ] ✅ Формы через React Hook Form + Yup
- [ ] ✅ Обрабатываются ошибки
- [ ] ✅ Переиспользуемые компоненты в shared
- [ ] ✅ Public API экспорт через index.ts
- [ ] ✅ Imports только из нижних слоев

---

## Антипаттерны - чего избегать

### 1. Prop Drilling

\`\`\`typescript
// ❌ НЕПРАВИЛЬНО
<ComponentA user={user}>
  <ComponentB user={user}>
    <ComponentC user={user}>
      <ComponentD user={user} />

// ✅ ПРАВИЛЬНО - используем контекст или Redux
const user = useAppSelector(state => state.user);
\`\`\`

### 2. Магические числа/строки

\`\`\`typescript
// ❌ НЕПРАВИЛЬНО
if (user.role === 'ADMIN') { }

// ✅ ПРАВИЛЬНО
const USER_ROLES = {
  ADMIN: 'ADMIN',
  USER: 'USER',
} as const;

if (user.role === USER_ROLES.ADMIN) { }
\`\`\`

### 3. Длинные файлы

\`\`\`typescript
// ❌ НЕПРАВИЛЬНО - 500+ строк в одном файле

// ✅ ПРАВИЛЬНО - декомпозиция
// Один файл = одна ответственность
// Максимум 200-300 строк
\`\`\`

### 4. Бизнес-логика в компонентах

\`\`\`typescript
// ❌ НЕПРАВИЛЬНО
const PropertyCard = () => {
  const calculateDiscount = () => { /* сложная логика */ };
  const validateProperty = () => { /* еще логика */ };
  
  return <div>...</div>;
};

// ✅ ПРАВИЛЬНО - логика в model или lib
const PropertyCard = () => {
  const discount = usePropertyDiscount(property);
  const isValid = usePropertyValidation(property);
  
  return <div>...</div>;
};
\`\`\`

---

## 📋 Чек-лист новой фичи

Когда создаешь новую фичу:

1. [ ] Определил слой FSD (где размещать)
2. [ ] Создал правильную структуру папок
3. [ ] Типизировал все интерфейсы
4. [ ] Вынес переиспользуемые части в shared
5. [ ] Отделил логику от UI
6. [ ] Использовал RTK Query для API
7. [ ] Добавил обработку ошибок
8. [ ] Использовал существующие компоненты из shared/ui
9. [ ] Проверил, что источник истины - бэкенд
10. [ ] Создал Public API через index.ts
11. [ ] Убедился, что нет дублирования кода
12. [ ] Следовал принципам SOLID

---

## 🎓 Принципы SOLID для React

### S - Single Responsibility
Компонент/модуль = одна ответственность

### O - Open/Closed
Расширяем через props, не меняя код

### L - Liskov Substitution
Подтипы должны заменять базовые типы

### I - Interface Segregation
Не заставляем использовать ненужные props

### D - Dependency Inversion
Зависим от абстракций (интерфейсов), не от конкретики

---

## Performance - оптимизация

### 1. Ленивая загрузка (Code Splitting)

#### Ленивая загрузка страниц (обязательно!)

\`\`\`typescript
// app/providers/router.tsx
import { lazy, Suspense } from 'react';

// ✅ ПРАВИЛЬНО - ленивая загрузка страниц
const HomePage = lazy(() => import('@/pages/home'));
const LoginPage = lazy(() => import('@/pages/auth/login'));
const PropertiesPage = lazy(() => import('@/pages/properties'));

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <Suspense fallback={<PageLoader />}>
        <HomePage />
      </Suspense>
    ),
  },
  // ...
]);

// ❌ НЕПРАВИЛЬНО - все импорты сразу
import { HomePage } from '@/pages/home';
import { LoginPage } from '@/pages/auth/login';
\`\`\`

#### Ленивая загрузка тяжелых компонентов

\`\`\`typescript
// ✅ ПРАВИЛЬНО - ленивая загрузка тяжелых библиотек
const ChartComponent = lazy(() => import('./ChartComponent')); // если использует recharts
const MapComponent = lazy(() => import('./MapComponent'));     // если использует yandex-maps

const Dashboard = () => (
  <div>
    <Suspense fallback={<Spinner />}>
      <ChartComponent data={data} />
    </Suspense>
  </div>
);
\`\`\`

#### Правило: что загружать лениво?
- ✅ Все страницы (routes)
- ✅ Модальные окна
- ✅ Табы, которые не видны сразу
- ✅ Компоненты с тяжелыми библиотеками (графики, карты)
- ✅ Компоненты "ниже сгиба" (below the fold)

### 2. React.memo - предотвращение лишних рендеров

\`\`\`typescript
// ✅ ПРАВИЛЬНО - мемоизация компонента
export const PropertyCard = React.memo(({ property, onFavorite }: Props) => {
  return (
    <Card>
      <PropertyImage src={property.image} />
      <PropertyTitle>{property.title}</PropertyTitle>
      <Button onClick={onFavorite}>Избранное</Button>
    </Card>
  );
});

// ❌ НЕПРАВИЛЬНО - рендерится при каждом изменении родителя
export const PropertyCard = ({ property, onFavorite }: Props) => {
  return <Card>...</Card>;
};
\`\`\`

**Когда использовать React.memo:**
- ✅ Компонент часто рендерится с теми же props
- ✅ Компонент тяжелый (много вложенности, вычислений)
- ✅ Список элементов (карточки, строки таблицы)

**Когда НЕ использовать:**
- ❌ Компонент всегда рендерится с новыми props
- ❌ Очень простой компонент (1-2 элемента)
- ❌ Компонент используется 1 раз

### 3. useMemo - мемоизация вычислений

\`\`\`typescript
// ✅ ПРАВИЛЬНО - мемоизация тяжелых вычислений
const PropertyList = ({ properties }: Props) => {
  const sortedProperties = useMemo(() => {
    return properties
      .filter(p => p.isActive)
      .sort((a, b) => b.price - a.price)
      .slice(0, 20);
  }, [properties]);
  
  return <div>{sortedProperties.map(...)}</div>;
};

// ❌ НЕПРАВИЛЬНО - вычисления при каждом рендере
const PropertyList = ({ properties }: Props) => {
  const sortedProperties = properties
    .filter(p => p.isActive)
    .sort((a, b) => b.price - a.price); // пересортировка при каждом рендере!
    
  return <div>{sortedProperties.map(...)}</div>;
};
\`\`\`

**Когда использовать useMemo:**
- ✅ Фильтрация/сортировка больших массивов
- ✅ Сложные вычисления (математика, форматирование)
- ✅ Создание объектов/массивов для props

**Когда НЕ использовать:**
- ❌ Простые вычисления (сложение, конкатенация)
- ❌ Вычисления выполняются быстро

### 4. useCallback - мемоизация функций

\`\`\`typescript
// ✅ ПРАВИЛЬНО - мемоизация callback
const PropertyList = ({ properties }: Props) => {
  const [favorites, setFavorites] = useState<string[]>([]);
  
  const handleFavorite = useCallback((id: string) => {
    setFavorites(prev => [...prev, id]);
  }, []);
  
  return (
    <div>
      {properties.map(property => (
        <PropertyCard
          key={property.id}
          property={property}
          onFavorite={handleFavorite} // стабильная ссылка
        />
      ))}
    </div>
  );
};

// ❌ НЕПРАВИЛЬНО - новая функция при каждом рендере
const PropertyList = ({ properties }: Props) => {
  const [favorites, setFavorites] = useState<string[]>([]);
  
  return (
    <div>
      {properties.map(property => (
        <PropertyCard
          property={property}
          onFavorite={(id) => setFavorites([...favorites, id])} // новая функция!
        />
      ))}
    </div>
  );
};
\`\`\`

**Когда использовать useCallback:**
- ✅ Функция передается в React.memo компонент
- ✅ Функция в dependencies других хуков
- ✅ Функция используется в списках

### 5. Виртуализация длинных списков

\`\`\`typescript
// ✅ ПРАВИЛЬНО - виртуализация для больших списков
import { FixedSizeList } from 'react-window';

const PropertyList = ({ properties }: Props) => {
  return (
    <FixedSizeList
      height={600}
      itemCount={properties.length}
      itemSize={200}
      width="100%"
    >
      {({ index, style }) => (
        <div style={style}>
          <PropertyCard property={properties[index]} />
        </div>
      )}
    </FixedSizeList>
  );
};

// ❌ НЕПРАВИЛЬНО - рендер всех 1000+ элементов
const PropertyList = ({ properties }: Props) => {
  return (
    <div>
      {properties.map(property => (
        <PropertyCard key={property.id} property={property} />
      ))}
    </div>
  );
};
\`\`\`

**Когда использовать виртуализацию:**
- ✅ Список > 50-100 элементов
- ✅ Таблицы с большим количеством строк
- ✅ Бесконечный скролл

**Библиотеки:**
- \`react-window\` (легкая)
- \`react-virtualized\` (больше возможностей)

### 6. Оптимизация изображений

\`\`\`typescript
// ✅ ПРАВИЛЬНО - lazy loading изображений
<img
  src={property.image}
  alt={property.title}
  loading="lazy" // нативная ленивая загрузка
  width={300}
  height={200}
/>

// ✅ ПРАВИЛЬНО - responsive images
<img
  srcSet={\`
    \${property.imageSmall} 300w,
    \${property.imageMedium} 768w,
    \${property.imageLarge} 1200w
  \`}
  sizes="(max-width: 768px) 300px, (max-width: 1200px) 768px, 1200px"
  src={property.image}
  alt={property.title}
  loading="lazy"
/>

// ❌ НЕПРАВИЛЬНО - загрузка всех изображений сразу
<img src={property.image} alt={property.title} />
\`\`\`

**Правила:**
- ✅ Всегда \`loading="lazy"\` для изображений вне viewport
- ✅ Указывай \`width\` и \`height\` (избежание layout shift)
- ✅ Используй WebP формат
- ✅ Оптимизируй размер изображений

### 7. Debounce и Throttle

#### Debounce для поиска

\`\`\`typescript
// shared/lib/hooks/useDebounce.ts
export const useDebounce = <T>(value: T, delay: number): T => {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => clearTimeout(handler);
  }, [value, delay]);

  return debouncedValue;
};

// Использование
const SearchInput = () => {
  const [search, setSearch] = useState('');
  const debouncedSearch = useDebounce(search, 300);
  
  const { data } = useSearchPropertiesQuery(debouncedSearch, {
    skip: !debouncedSearch, // не запрашиваем пустой поиск
  });
  
  return <input value={search} onChange={(e) => setSearch(e.target.value)} />;
};
\`\`\`

#### Throttle для скролла

\`\`\`typescript
// shared/lib/hooks/useThrottle.ts
export const useThrottle = <T extends (...args: any[]) => any>(
  callback: T,
  delay: number
) => {
  const lastRun = useRef(Date.now());

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();
      if (now - lastRun.current >= delay) {
        callback(...args);
        lastRun.current = now;
      }
    },
    [callback, delay]
  );
};

// Использование
const InfiniteScroll = () => {
  const handleScroll = useThrottle(() => {
    // проверка нужно ли загружать еще
  }, 200);
  
  useEffect(() => {
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [handleScroll]);
};
\`\`\`

### 8. RTK Query оптимизация

\`\`\`typescript
// ✅ ПРАВИЛЬНО - polling только когда нужно
const { data } = useGetPropertiesQuery(undefined, {
  pollingInterval: 60000, // обновление каждую минуту
  skip: !isActive,        // не запрашиваем если страница неактивна
});

// ✅ ПРАВИЛЬНО - prefetch для быстрой навигации
const PropertyList = () => {
  const [prefetch] = usePrefetch('getProperty');
  
  return (
    <div>
      {properties.map(property => (
        <Link
          to={\`/property/\${property.id}\`}
          onMouseEnter={() => prefetch(property.id)} // предзагрузка при hover
        >
          {property.title}
        </Link>
      ))}
    </div>
  );
};

// ✅ ПРАВИЛЬНО - invalidation только нужных тегов
invalidatesTags: (result, error, { id }) => [
  { type: 'Property', id },     // только конкретный объект
  { type: 'Property', id: 'LIST' }, // список
];
\`\`\`

### 9. Bundle Size оптимизация

#### Избегаем больших библиотек

\`\`\`typescript
// ❌ НЕПРАВИЛЬНО - импорт всей библиотеки
import _ from 'lodash';
_.debounce(fn, 300);

// ✅ ПРАВИЛЬНО - импорт конкретной функции
import debounce from 'lodash/debounce';
debounce(fn, 300);

// ❌ НЕПРАВИЛЬНО - moment.js (тяжелая)
import moment from 'moment';

// ✅ ПРАВИЛЬНО - date-fns (легче, tree-shakeable)
import { format } from 'date-fns';
\`\`\`

#### Анализ bundle

\`\`\`bash
# Проверяем размер bundle
npm run build

# Анализируем что весит много
npx vite-bundle-visualizer
\`\`\`

### 10. Избегаем лишних рендеров

\`\`\`typescript
// ❌ НЕПРАВИЛЬНО - новый объект при каждом рендере
const PropertyCard = ({ property }: Props) => {
  const style = { color: 'red' }; // новый объект!
  return <div style={style}>...</div>;
};

// ✅ ПРАВИЛЬНО - стабильный объект
const style = { color: 'red' }; // вне компонента

const PropertyCard = ({ property }: Props) => {
  return <div style={style}>...</div>;
};

// ✅ ПРАВИЛЬНО - мемоизация
const PropertyCard = ({ property }: Props) => {
  const style = useMemo(() => ({ color: property.color }), [property.color]);
  return <div style={style}>...</div>;
};
\`\`\`

### 11. Проверка performance

\`\`\`typescript
// Профилирование в React DevTools
import { Profiler } from 'react';

const onRenderCallback = (
  id: string,
  phase: "mount" | "update",
  actualDuration: number
) => {
  console.log(\`\${id} took \${actualDuration}ms to \${phase}\`);
};

<Profiler id="PropertyList" onRender={onRenderCallback}>
  <PropertyList />
</Profiler>
\`\`\`

---

## Performance Checklist

При разработке проверяй:

- [ ] ✅ Страницы загружаются лениво (React.lazy)
- [ ] ✅ Тяжелые компоненты в React.memo
- [ ] ✅ Сложные вычисления в useMemo
- [ ] ✅ Функции в useCallback (если в deps или props)
- [ ] ✅ Списки > 100 элементов виртуализированы
- [ ] ✅ Изображения с \`loading="lazy"\`
- [ ] ✅ Поиск с debounce (300ms)
- [ ] ✅ Скролл/resize с throttle (200ms)
- [ ] ✅ RTK Query с правильной invalidation
- [ ] ✅ Избегаем тяжелых библиотек
- [ ] ✅ Bundle size проверен
- [ ] ✅ Нет лишних рендеров (React DevTools Profiler)

---

---

## 📚 Итоговые правила (краткая версия)

1. **Источник истины - ТОЛЬКО БЭКЕНД**
2. **Строго следуем FSD**
3. **DRY - не повторяемся**
4. **SRP - одна ответственность**
5. **Декомпозиция - разбиваем на мелкие части**
6. **RTK Query для API**
7. **React Hook Form + Yup для форм**
8. **Типизация всего (no \`any\`)**
9. **Переиспользуемые компоненты в shared**
10. **Бизнес-логика отдельно от UI**

---

**Эти правила ОБЯЗАТЕЛЬНЫ для всей разработки!**

При каждом новом файле/фиче - проверяй соответствие этому документу.

`;
