---
title: 정규화 (Normalization)
domain: database
category: rdbms
tags: [database, rdbms]
level: intermediate
status: published
created: 2026-05-12
updated: 2026-05-12
velog: true
related: []
---

# 정규화 (Normalization)

## 목적

- 데이터 중복 제거
- 삽입·수정·삭제 이상(Anomaly) 방지
- 데이터 무결성 유지

## 정규형 단계

### 1NF (제1정규형)

**조건**: 모든 컬럼 값이 원자값(Atomic), 반복 그룹 없음

```
❌ Before
| id | name | phone              |
|----|------|--------------------|
|  1 | 홍길동 | 010-1111, 010-2222 |

✅ After
| id | name | phone      |
|----|------|------------|
|  1 | 홍길동 | 010-1111  |
|  1 | 홍길동 | 010-2222  |
```

### 2NF (제2정규형)

**조건**: 1NF + 부분 함수 종속 제거  
복합 PK에서 일부 컬럼에만 종속된 컬럼을 분리

```
❌ Before (PK: student_id + course_id)
| student_id | course_id | grade | student_name |
|------------|-----------|-------|--------------|
| 1          | CS101     | A     | 홍길동        |

student_name은 student_id에만 종속 → 부분 종속

✅ After
students: (student_id, student_name)
enrollments: (student_id, course_id, grade)
```

### 3NF (제3정규형)

**조건**: 2NF + 이행 함수 종속 제거  
PK → A → B 관계에서 B를 분리

```
❌ Before
| id | zip   | city  |
|----|-------|-------|
|  1 | 04524 | Seoul |

id → zip → city (이행 종속)

✅ After
users: (id, zip)
zip_codes: (zip, city)
```

### BCNF (Boyce-Codd Normal Form)

**조건**: 모든 결정자가 후보키  
3NF를 만족해도 결정자가 후보키가 아닌 경우 위반

### 4NF, 5NF

- 4NF: 다치 종속(Multi-valued Dependency) 제거
- 5NF: 조인 종속(Join Dependency) 제거
- 실무에서는 보통 3NF 또는 BCNF까지 적용

## 비정규화 (Denormalization)

정규화된 구조를 의도적으로 중복 허용하여 조회 성능을 높이는 기법.

**언제 사용?**
- 조인이 너무 많아 조회 성능이 심각하게 저하될 때
- 읽기 빈도 >> 쓰기 빈도인 경우

**트레이드오프**
- 조회 성능 향상 ↔ 데이터 중복·일관성 관리 부담 증가
