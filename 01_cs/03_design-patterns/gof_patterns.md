---
title: GoF 디자인 패턴 (면접 빈출)
domain: cs
category: design-patterns
tags:
  - cs
  - design-patterns
level: intermediate
status: published
created: 2026-07-16
updated: 2026-07-16
velog: false
related: []
---

# GoF 디자인 패턴 (면접 빈출)

---

## 1. Singleton (싱글톤) — 생성 패턴

**클래스의 인스턴스를 하나만** 생성하고 전역으로 접근 가능하게 함.

```python
class Singleton:
    _instance = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super().__new__(cls)
        return cls._instance

# 사용
a = Singleton()
b = Singleton()
print(a is b)  # True
```

**사용처**: DB 커넥션 풀, 로거, 설정 객체  
**단점**: 전역 상태로 테스트 어려움, 멀티스레드 환경에서 동기화 필요  
**면접 포인트**: "멀티스레드 환경에서 thread-safe Singleton을 어떻게 구현?" → `threading.Lock` 또는 DCL(Double-Checked Locking)

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 260" font-family="'Malgun Gothic','Segoe UI',sans-serif">
  <defs>
    <marker id="gof-singleton-arrow" markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto">
      <path d="M0,0 L7,3 L0,6 Z" fill="#333"/>
    </marker>
  </defs>
  <text x="210" y="26" text-anchor="middle" font-weight="bold" font-size="16">Singleton 구조</text>

  <!-- Singleton class box -->
  <rect x="130" y="55" width="160" height="120" rx="4" fill="#e8f0fe" stroke="#333" stroke-width="1.5"/>
  <text x="210" y="76" text-anchor="middle" font-size="14" font-weight="bold">Singleton</text>
  <line x1="130" y1="86" x2="290" y2="86" stroke="#333" stroke-width="1.5"/>
  <text x="140" y="106" font-size="12">- _instance : Singleton</text>
  <line x1="130" y1="116" x2="290" y2="116" stroke="#333" stroke-width="1.5"/>
  <text x="140" y="136" font-size="12">+ getInstance() : Singleton</text>
  <text x="140" y="158" font-size="12">- __init__()</text>

  <!-- self reference (holds its own single instance) -->
  <path d="M290,110 C360,110 360,70 292,70" fill="none" stroke="#333" stroke-width="2" marker-end="url(#gof-singleton-arrow)"/>
  <text x="350" y="94" text-anchor="middle" font-size="11">① 유일 인스턴스</text>
  <text x="350" y="108" text-anchor="middle" font-size="11">보관·재사용</text>

  <!-- client -->
  <rect x="40" y="205" width="120" height="40" rx="4" fill="#e2e3e5" stroke="#333" stroke-width="1.5"/>
  <text x="100" y="230" text-anchor="middle" font-size="13">Client</text>
  <line x1="130" y1="205" x2="180" y2="177" stroke="#333" stroke-width="2" marker-end="url(#gof-singleton-arrow)"/>
  <text x="235" y="205" text-anchor="middle" font-size="11">② getInstance() 호출</text>
</svg>

<sub>getInstance()는 최초 1회만 인스턴스를 만들어 `_instance`에 보관하고, 이후 호출엔 같은 객체를 반환한다. Client가 몇 번을 호출해도 동일 인스턴스.</sub>

---

## 2. Factory Method (팩토리 메서드) — 생성 패턴

**객체 생성을 서브클래스에 위임**. 생성할 클래스를 클라이언트가 몰라도 됨.

```python
class Animal:
    def speak(self): pass

class Dog(Animal):
    def speak(self): return "Woof"

class Cat(Animal):
    def speak(self): return "Meow"

def animal_factory(kind: str) -> Animal:
    animals = {"dog": Dog, "cat": Cat}
    return animals[kind]()

animal = animal_factory("dog")
print(animal.speak())  # Woof
```

**vs Abstract Factory**: Factory Method는 단일 제품군, Abstract Factory는 관련 제품들의 패밀리 생성

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 300" font-family="'Malgun Gothic','Segoe UI',sans-serif">
  <defs>
    <marker id="gof-factory-arrow" markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto">
      <path d="M0,0 L7,3 L0,6 Z" fill="#333"/>
    </marker>
    <marker id="gof-factory-tri" markerWidth="14" markerHeight="14" refX="11" refY="6" orient="auto">
      <path d="M0,0 L11,6 L0,12 Z" fill="#fff" stroke="#333" stroke-width="1"/>
    </marker>
  </defs>
  <text x="240" y="26" text-anchor="middle" font-weight="bold" font-size="16">Factory Method 구조</text>

  <!-- Animal (product interface) -->
  <rect x="180" y="45" width="120" height="52" rx="4" fill="#fff3cd" stroke="#333" stroke-width="1.5"/>
  <text x="240" y="66" text-anchor="middle" font-size="13" font-weight="bold">«interface»</text>
  <text x="240" y="84" text-anchor="middle" font-size="13">Animal</text>

  <!-- Dog / Cat (concrete products) -->
  <rect x="60" y="175" width="120" height="60" rx="4" fill="#d4edda" stroke="#333" stroke-width="1.5"/>
  <text x="120" y="199" text-anchor="middle" font-size="13" font-weight="bold">Dog</text>
  <line x1="60" y1="208" x2="180" y2="208" stroke="#333" stroke-width="1.5"/>
  <text x="120" y="226" text-anchor="middle" font-size="12">+ speak()</text>

  <rect x="300" y="175" width="120" height="60" rx="4" fill="#d4edda" stroke="#333" stroke-width="1.5"/>
  <text x="360" y="199" text-anchor="middle" font-size="13" font-weight="bold">Cat</text>
  <line x1="300" y1="208" x2="420" y2="208" stroke="#333" stroke-width="1.5"/>
  <text x="360" y="226" text-anchor="middle" font-size="12">+ speak()</text>

  <!-- inheritance (hollow triangle toward interface) -->
  <line x1="120" y1="175" x2="205" y2="99" stroke="#333" stroke-width="2" marker-end="url(#gof-factory-tri)"/>
  <line x1="360" y1="175" x2="275" y2="99" stroke="#333" stroke-width="2" marker-end="url(#gof-factory-tri)"/>

  <!-- factory function -->
  <rect x="180" y="245" width="120" height="44" rx="4" fill="#e8f0fe" stroke="#333" stroke-width="1.5"/>
  <text x="240" y="264" text-anchor="middle" font-size="12" font-weight="bold">animal_factory</text>
  <text x="240" y="280" text-anchor="middle" font-size="11">(kind) → Animal</text>

  <!-- factory creates products -->
  <line x1="200" y1="245" x2="140" y2="237" stroke="#333" stroke-width="2" stroke-dasharray="4 3" marker-end="url(#gof-factory-arrow)"/>
  <line x1="280" y1="245" x2="340" y2="237" stroke="#333" stroke-width="2" stroke-dasharray="4 3" marker-end="url(#gof-factory-arrow)"/>
  <text x="240" y="150" text-anchor="middle" font-size="11">「어떤 구체 클래스를 만들지」를 팩토리가 결정</text>
</svg>

<sub>클라이언트는 `Animal` 인터페이스만 알고, 팩토리가 `kind`에 따라 `Dog`/`Cat` 등 구체 클래스를 생성해 반환한다. 새 동물 추가 시 팩토리만 손대면 됨(OCP).</sub>

---

## 3. Builder (빌더) — 생성 패턴

**복잡한 객체의 생성 과정을 단계별로** 분리. 같은 과정으로 다른 표현 생성 가능.

```python
class QueryBuilder:
    def __init__(self):
        self._query = {}

    def table(self, name):
        self._query["table"] = name
        return self  # 메서드 체이닝

    def where(self, condition):
        self._query["where"] = condition
        return self

    def build(self):
        return f"SELECT * FROM {self._query['table']} WHERE {self._query.get('where', '1=1')}"

query = QueryBuilder().table("users").where("age > 18").build()
```

**사용처**: SQL 쿼리 빌더, HTTP 클라이언트 설정, 테스트 픽스처 생성

---

## 4. Adapter (어댑터) — 구조 패턴

**호환되지 않는 인터페이스를 연결**. 기존 코드 변경 없이 다른 인터페이스와 연동.

```python
class OldLibrary:
    def old_method(self):
        return "old data"

class NewInterface:
    def new_method(self): pass

class Adapter(NewInterface):
    def __init__(self, old):
        self.old = old

    def new_method(self):
        return self.old.old_method()  # 변환

adapter = Adapter(OldLibrary())
adapter.new_method()  # 기존 코드를 새 인터페이스로 사용
```

**사용처**: 레거시 시스템 통합, 외부 라이브러리 래핑

---

## 5. Decorator (데코레이터) — 구조 패턴

**객체에 동적으로 새 기능을 추가**. 상속 없이 기능 확장.

```python
def logging_decorator(func):
    def wrapper(*args, **kwargs):
        print(f"Calling {func.__name__}")
        result = func(*args, **kwargs)
        print(f"Done {func.__name__}")
        return result
    return wrapper

@logging_decorator
def fetch_data():
    return "data"
```

**사용처**: 로깅, 캐싱, 인증 검사, Python `@functools.lru_cache`  
**vs Proxy**: Decorator는 기능 추가, Proxy는 접근 제어

---

## 6. Proxy (프록시) — 구조 패턴

**다른 객체에 대한 접근을 제어**하는 대리 객체.

| 종류 | 용도 |
|------|------|
| 가상 프록시 | 무거운 객체의 지연 초기화 |
| 보호 프록시 | 접근 권한 제어 |
| 원격 프록시 | 원격 객체 로컬 표현 (RPC, gRPC) |
| 캐싱 프록시 | 결과 캐싱 |

**사용처**: ORM의 lazy loading, CDN, API 게이트웨이, 스프링 AOP

---

## 7. Observer (옵저버) — 행동 패턴

**한 객체의 상태 변화를 구독한 여러 객체에게 자동 통보**.

```python
class EventEmitter:
    def __init__(self):
        self._listeners = {}

    def on(self, event, callback):
        self._listeners.setdefault(event, []).append(callback)

    def emit(self, event, *args):
        for cb in self._listeners.get(event, []):
            cb(*args)

emitter = EventEmitter()
emitter.on("data", lambda x: print(f"Received: {x}"))
emitter.emit("data", 42)  # Received: 42
```

**사용처**: 이벤트 시스템, GUI 이벤트 리스너, MVC의 Model-View 연결, React state

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 250" font-family="'Malgun Gothic','Segoe UI',sans-serif">
  <defs>
    <marker id="gof-observer-arrow" markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto">
      <path d="M0,0 L7,3 L0,6 Z" fill="#333"/>
    </marker>
  </defs>
  <text x="240" y="26" text-anchor="middle" font-weight="bold" font-size="16">Observer 구조 (통보 흐름)</text>

  <!-- Subject -->
  <rect x="30" y="80" width="150" height="90" rx="4" fill="#e8f0fe" stroke="#333" stroke-width="1.5"/>
  <text x="105" y="101" text-anchor="middle" font-size="13" font-weight="bold">Subject</text>
  <text x="105" y="120" text-anchor="middle" font-size="12">(EventEmitter)</text>
  <line x1="30" y1="130" x2="180" y2="130" stroke="#333" stroke-width="1.5"/>
  <text x="40" y="148" font-size="11">+ on(event, cb)</text>
  <text x="40" y="164" font-size="11">+ emit(event, data)</text>

  <!-- Observers -->
  <rect x="320" y="45" width="140" height="40" rx="4" fill="#d4edda" stroke="#333" stroke-width="1.5"/>
  <text x="390" y="70" text-anchor="middle" font-size="12">Observer A (cb)</text>

  <rect x="320" y="105" width="140" height="40" rx="4" fill="#d4edda" stroke="#333" stroke-width="1.5"/>
  <text x="390" y="130" text-anchor="middle" font-size="12">Observer B (cb)</text>

  <rect x="320" y="165" width="140" height="40" rx="4" fill="#d4edda" stroke="#333" stroke-width="1.5"/>
  <text x="390" y="190" text-anchor="middle" font-size="12">Observer C (cb)</text>

  <!-- emit -> notify all -->
  <line x1="180" y1="120" x2="316" y2="65" stroke="#333" stroke-width="2" marker-end="url(#gof-observer-arrow)"/>
  <line x1="180" y1="125" x2="316" y2="125" stroke="#333" stroke-width="2" marker-end="url(#gof-observer-arrow)"/>
  <line x1="180" y1="130" x2="316" y2="185" stroke="#333" stroke-width="2" marker-end="url(#gof-observer-arrow)"/>
  <text x="250" y="230" text-anchor="middle" font-size="11">① emit() → 등록된 모든 구독자에게 ② 자동 통보(콜백 실행)</text>
</svg>

<sub>구독자는 `on()`으로 이벤트에 콜백을 등록하고, Subject가 `emit()`하면 등록된 모든 콜백이 자동 호출된다. Subject는 구독자를 개별로 알 필요 없이 리스트만 순회.</sub>

---

## 8. Strategy (전략) — 행동 패턴

**알고리즘 군을 정의하고 런타임에 교체 가능**하게 캡슐화.

```python
class Sorter:
    def __init__(self, strategy):
        self.strategy = strategy

    def sort(self, data):
        return self.strategy(data)

sorter = Sorter(sorted)               # 기본 정렬
sorter = Sorter(lambda d: sorted(d, reverse=True))  # 역순
```

**사용처**: 정렬 알고리즘 선택, 결제 방법 선택, 압축 알고리즘  
**vs Template Method**: Strategy는 전체 알고리즘 교체, Template Method는 일부 단계만 교체

<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 500 280" font-family="'Malgun Gothic','Segoe UI',sans-serif">
  <defs>
    <marker id="gof-strategy-arrow" markerWidth="10" markerHeight="10" refX="7" refY="3" orient="auto">
      <path d="M0,0 L7,3 L0,6 Z" fill="#333"/>
    </marker>
    <marker id="gof-strategy-tri" markerWidth="14" markerHeight="14" refX="11" refY="6" orient="auto">
      <path d="M0,0 L11,6 L0,12 Z" fill="#fff" stroke="#333" stroke-width="1"/>
    </marker>
  </defs>
  <text x="250" y="26" text-anchor="middle" font-weight="bold" font-size="16">Strategy 구조 (컴포지션)</text>

  <!-- Context -->
  <rect x="40" y="60" width="150" height="80" rx="4" fill="#e8f0fe" stroke="#333" stroke-width="1.5"/>
  <text x="115" y="82" text-anchor="middle" font-size="13" font-weight="bold">Context (Sorter)</text>
  <line x1="40" y1="92" x2="190" y2="92" stroke="#333" stroke-width="1.5"/>
  <text x="50" y="112" font-size="11">- strategy</text>
  <line x1="40" y1="120" x2="190" y2="120" stroke="#333" stroke-width="1.5"/>
  <text x="50" y="134" font-size="11">+ sort(data)</text>

  <!-- Strategy interface -->
  <rect x="300" y="60" width="160" height="60" rx="4" fill="#fff3cd" stroke="#333" stroke-width="1.5"/>
  <text x="380" y="81" text-anchor="middle" font-size="12" font-weight="bold">«interface» Strategy</text>
  <line x1="300" y1="91" x2="460" y2="91" stroke="#333" stroke-width="1.5"/>
  <text x="310" y="110" font-size="11">+ execute(data)</text>

  <!-- Context holds Strategy (has-a) -->
  <line x1="190" y1="95" x2="296" y2="90" stroke="#333" stroke-width="2" marker-end="url(#gof-strategy-arrow)"/>
  <text x="245" y="82" text-anchor="middle" font-size="11">① 주입</text>

  <!-- concrete strategies -->
  <rect x="290" y="175" width="180" height="34" rx="4" fill="#d4edda" stroke="#333" stroke-width="1.5"/>
  <text x="380" y="197" text-anchor="middle" font-size="12">AscendingSort</text>

  <rect x="290" y="222" width="180" height="34" rx="4" fill="#d4edda" stroke="#333" stroke-width="1.5"/>
  <text x="380" y="244" text-anchor="middle" font-size="12">DescendingSort</text>

  <!-- concrete implement interface -->
  <line x1="380" y1="175" x2="380" y2="122" stroke="#333" stroke-width="2" marker-end="url(#gof-strategy-tri)"/>
  <line x1="360" y1="222" x2="365" y2="122" stroke="#333" stroke-width="2" marker-end="url(#gof-strategy-tri)"/>
  <text x="250" y="180" text-anchor="middle" font-size="11">② 런타임에</text>
  <text x="250" y="196" text-anchor="middle" font-size="11">알고리즘 교체</text>
</svg>

<sub>Context는 `Strategy` 인터페이스에만 의존하고, 구체 알고리즘 객체를 주입받아 런타임에 통째로 교체한다. 상속(Template Method)과 달리 조합(컴포지션)으로 동작을 바꾼다.</sub>

---

## 9. Command (커맨드) — 행동 패턴

**요청을 객체로 캡슐화**. 요청의 큐잉, 로깅, Undo/Redo 가능.

```python
class Command:
    def execute(self): pass
    def undo(self): pass

class AddTextCommand(Command):
    def __init__(self, editor, text):
        self.editor = editor
        self.text = text

    def execute(self):
        self.editor.content += self.text

    def undo(self):
        self.editor.content = self.editor.content[:-len(self.text)]
```

**사용처**: Undo/Redo, 작업 큐, 트랜잭션, 매크로 기록

---

## 10. Template Method (템플릿 메서드) — 행동 패턴

**알고리즘의 뼈대를 슈퍼클래스에 정의**하고 일부 단계를 서브클래스에서 구현.

```python
class DataProcessor:
    def process(self):           # 템플릿 메서드
        data = self.read()
        result = self.transform(data)
        self.write(result)

    def read(self): pass         # 서브클래스 구현
    def transform(self, data): pass
    def write(self, result): pass
```

**사용처**: 프레임워크의 훅 메서드, JUnit의 setUp/tearDown

---

## 면접 자주 출제 Q&A

**Q. Singleton의 문제점은?**  
→ 전역 상태 → 테스트 격리 어려움, 의존성 숨김. 멀티스레드 환경에서 race condition. 해결: DI(의존성 주입) 컨테이너로 관리.

**Q. Strategy와 Template Method 차이?**  
→ Strategy는 컴포지션(Strategy 객체 주입)으로 전체 알고리즘 교체, Template Method는 상속으로 일부 단계만 오버라이드.

**Q. Decorator와 상속의 차이?**  
→ 상속은 컴파일 타임에 고정, Decorator는 런타임에 동적으로 기능 조합 가능. 기능 조합이 많을수록 Decorator가 유연함 (조합 폭발 문제 해결).

**Q. Proxy와 Decorator 차이?**  
→ 겉보기엔 비슷하지만 의도가 다름. Proxy는 접근 제어 (보안, 캐싱, 지연 로딩), Decorator는 기능 추가. Proxy는 원본 객체를 직접 생성하지 않을 수 있음.
