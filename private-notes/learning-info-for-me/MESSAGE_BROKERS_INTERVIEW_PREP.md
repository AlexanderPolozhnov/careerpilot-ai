# Собеседование: Message Brokers — RabbitMQ & Apache Kafka

Гайд для подготовки к собеседованию. Охватывает теорию и практику брокеров сообщений: архитектуру, паттерны использования, сравнение RabbitMQ vs Kafka, интеграцию со Spring Boot.

---

## 1. Зачем нужны Message Brokers?

### 🎙️ Вопрос: *"Что такое брокер сообщений и какие проблемы он решает?"*

**💡 Ответ:**
> «**Message Broker** — промежуточный компонент, который принимает сообщения от **производителей (producers)** и доставляет их **потребителям (consumers)**, обеспечивая **асинхронное, слабосвязанное** взаимодействие между сервисами.
>
> **Какие проблемы решает:**
> 1. **Decoupling (развязка)**: Производитель не знает о потребителях — отправил и забыл. Если потребитель недоступен, сообщение не теряется.
> 2. **Асинхронность**: Долгие операции (отправка email, обработка файла) не блокируют HTTP-ответ.
> 3. **Load leveling**: Брокер поглощает пики нагрузки — потребитель обрабатывает с комфортной скоростью.
> 4. **Масштабирование**: Несколько экземпляров потребителя параллельно обрабатывают очередь.»

### Модели доставки сообщений:
| Модель | Описание | Пример |
|--------|---------|--------|
| **Point-to-Point (Queue)** | Одно сообщение → один потребитель | Обработка заказа ровно одним worker'ом |
| **Publish/Subscribe (Topic)** | Одно сообщение → все подписчики | Событие "новый пользователь" → email + CRM + аналитика |

---

## 2. RabbitMQ

### 🎙️ Вопрос: *"Объясните архитектуру RabbitMQ. Что такое Exchange и Queue?"*

**💡 Ответ:**
> «RabbitMQ реализует протокол **AMQP (Advanced Message Queuing Protocol)**. Архитектура:
> - **Producer** отправляет сообщение в **Exchange** (не в очередь напрямую!).
> - **Exchange** маршрутизирует сообщение в одну или несколько **Queue** по правилам **Binding**.
> - **Consumer** читает сообщения из Queue.»

```
Producer → Exchange → [Binding Rules] → Queue → Consumer
                                        Queue → Consumer
                                        Queue → Consumer
```

### Типы Exchange:
| Тип | Логика маршрутизации | Применение |
|-----|---------------------|-----------|
| **Direct** | Точное совпадение routing key | Обработка конкретного типа задачи |
| **Fanout** | Всем подключённым очередям | Broadcast-уведомления |
| **Topic** | Совпадение по шаблону (`*.error`, `order.#`) | Логирование по уровням, события по типам |
| **Headers** | Совпадение заголовков сообщения | Сложная маршрутизация без routing key |

### Ключевые концепции:

**Acknowledgment (подтверждение):**
```java
// AUTO ACK — RabbitMQ удаляет сообщение сразу после доставки (опасно!)
// MANUAL ACK — потребитель явно подтверждает обработку

@RabbitListener(queues = "order.processing")
public void processOrder(Order order, Channel channel,
                          @Header(AmqpHeaders.DELIVERY_TAG) long deliveryTag) {
    try {
        orderService.process(order);
        channel.basicAck(deliveryTag, false); // ✅ Успех — подтверждаем
    } catch (Exception e) {
        channel.basicNack(deliveryTag, false, true); // ❌ Ошибка — возвращаем в очередь
        // true = requeue (положить обратно), false = отправить в Dead Letter Queue
    }
}
```

**Dead Letter Queue (DLQ) — очередь для "мёртвых" сообщений:**
```yaml
# Сообщение попадает в DLQ если:
# 1. Потребитель отправил basicNack с requeue=false
# 2. Сообщение истекло по TTL
# 3. Очередь переполнена
```

```java
// Настройка DLQ через @Bean
@Bean
public Queue orderQueue() {
    return QueueBuilder.durable("order.processing")
        .withArgument("x-dead-letter-exchange", "dlx")
        .withArgument("x-dead-letter-routing-key", "order.dead")
        .withArgument("x-message-ttl", 30000) // TTL 30 секунд
        .build();
}

@Bean
public Queue deadLetterQueue() {
    return QueueBuilder.durable("order.dead").build();
}
```

### Spring AMQP интеграция:
```java
// Конфигурация
@Configuration
public class RabbitConfig {

    @Bean
    public DirectExchange orderExchange() {
        return new DirectExchange("order.exchange");
    }

    @Bean
    public Queue orderQueue() {
        return QueueBuilder.durable("order.queue").build();
    }

    @Bean
    public Binding orderBinding() {
        return BindingBuilder.bind(orderQueue()).to(orderExchange()).with("order.new");
    }

    @Bean
    public MessageConverter jsonMessageConverter() {
        return new Jackson2JsonMessageConverter(); // JSON вместо Java serialization
    }
}

// Producer
@Service
@RequiredArgsConstructor
public class OrderService {
    private final RabbitTemplate rabbitTemplate;

    public void placeOrder(Order order) {
        rabbitTemplate.convertAndSend("order.exchange", "order.new", order);
        log.info("Order {} sent to queue", order.getId());
    }
}

// Consumer
@Service
@Slf4j
public class OrderProcessor {

    @RabbitListener(queues = "order.queue")
    public void handleOrder(Order order) {
        log.info("Processing order: {}", order.getId());
        // обработка...
    }
}
```

---

## 3. Apache Kafka

### 🎙️ Вопрос: *"В чём принципиальное отличие Kafka от RabbitMQ? Как устроена Kafka?"*

**💡 Ответ:**
> «**Apache Kafka** — это **распределённый журнал событий (distributed event log)**, а не классический брокер очередей. Ключевые отличия:
> - Сообщения не удаляются после потребления — они хранятся в **log** определённое время (retention).
> - Потребители сами отслеживают своё положение в журнале через **offset**.
> - Kafka оптимизирована для огромных объёмов данных (миллионы событий/сек).
> - Порядок сообщений гарантирован внутри одной **партиции**.»

### Архитектура Kafka:
```
Producer → Topic (разделён на Partitions) → Consumer Group
                  │
                  ├── Partition 0 → Offset: 0, 1, 2, 3, ... → Consumer 1
                  ├── Partition 1 → Offset: 0, 1, 2, 3, ... → Consumer 2
                  └── Partition 2 → Offset: 0, 1, 2, 3, ... → Consumer 3
```

### Ключевые термины:

| Термин | Определение |
|--------|------------|
| **Topic** | Логическая категория сообщений (аналог exchange+queue в RabbitMQ) |
| **Partition** | Физическое хранилище данных, упорядоченный лог. Topic = несколько Partitions |
| **Offset** | Порядковый номер сообщения внутри партиции. Consumer сам хранит текущий offset |
| **Consumer Group** | Группа потребителей. Каждая партиция назначается ровно одному потребителю в группе |
| **Broker** | Сервер Kafka, хранит партиции |
| **Replication Factor** | Кол-во копий каждой партиции на разных брокерах (отказоустойчивость) |
| **Leader / Follower** | Для каждой партиции один брокер — лидер (обслуживает чтение/запись), остальные — фолловеры |
| **Retention** | Время хранения сообщений (по умолчанию 7 дней, не зависит от потребления) |
| **KRaft** | Современный режим без ZooKeeper (Kafka 3.x+) |

### Гарантии доставки:
| Гарантия | Описание | Как добиться |
|---------|---------|-------------|
| **At-most-once** | Не более одного раза (возможна потеря) | `acks=0`, авто-коммит offset до обработки |
| **At-least-once** | Не менее одного раза (возможны дубликаты) | `acks=all`, ручной коммит offset после обработки |
| **Exactly-once** | Ровно один раз | Идемпотентный producer (`enable.idempotence=true`) + транзакции |

### Spring Kafka интеграция:
```java
// application.yaml
spring:
  kafka:
    bootstrap-servers: localhost:9092
    consumer:
      group-id: careerpilot-notifications
      auto-offset-reset: earliest       # earliest = с начала; latest = только новые
      enable-auto-commit: false          # ручное управление offset
    producer:
      key-serializer: org.apache.kafka.common.serialization.StringSerializer
      value-serializer: org.springframework.kafka.support.serializer.JsonSerializer
```

```java
// Producer
@Service
@RequiredArgsConstructor
public class NotificationEventPublisher {

    private final KafkaTemplate<String, NotificationEvent> kafkaTemplate;

    public void publishNotification(NotificationEvent event) {
        kafkaTemplate.send("notifications", event.getUserId().toString(), event)
            .whenComplete((result, ex) -> {
                if (ex != null) {
                    log.error("Failed to send notification event", ex);
                } else {
                    log.info("Notification sent to partition {}, offset {}",
                        result.getRecordMetadata().partition(),
                        result.getRecordMetadata().offset());
                }
            });
    }
}

// Consumer
@Service
@Slf4j
public class NotificationConsumer {

    @KafkaListener(
        topics = "notifications",
        groupId = "careerpilot-notifications",
        containerFactory = "kafkaListenerContainerFactory"
    )
    public void handleNotification(
        @Payload NotificationEvent event,
        @Header(KafkaHeaders.RECEIVED_PARTITION) int partition,
        @Header(KafkaHeaders.OFFSET) long offset,
        Acknowledgment acknowledgment
    ) {
        try {
            log.info("Received notification from partition={}, offset={}", partition, offset);
            notificationService.process(event);
            acknowledgment.acknowledge(); // ручной коммит offset
        } catch (Exception e) {
            log.error("Error processing notification event: {}", event, e);
            // НЕ коммитим offset → сообщение будет перечитано
        }
    }
}
```

### Consumer Group и масштабирование:
```
Topic "notifications" с 3 партициями + Consumer Group с 3 экземплярами:
  Partition 0 → Consumer Instance 1
  Partition 1 → Consumer Instance 2
  Partition 2 → Consumer Instance 3
  (максимальный параллелизм)

Если Consumer Instances > Partitions:
  Partition 0 → Consumer 1
  Partition 1 → Consumer 2
  Consumer 3  → IDLE (не получает сообщений — бесполезен!)

⚠️ Нельзя создать больше параллельных потребителей чем партиций!
```

---

## 4. RabbitMQ vs Kafka: Сравнение

### 🎙️ Вопрос: *"Когда выбирать RabbitMQ, а когда Kafka?"*

| Характеристика | RabbitMQ | Apache Kafka |
|---------------|---------|-------------|
| **Модель** | Message Queue (push) | Distributed Log (pull) |
| **Хранение** | Сообщение удаляется после ACK | Хранится по retention (дни/недели) |
| **Порядок** | FIFO в рамках очереди | Гарантирован внутри партиции |
| **Пропускная способность** | Десятки тысяч/сек | Миллионы/сек |
| **Routing** | Гибкая (Exchange типы) | Только по топику/партиции |
| **Воспроизведение** | ❌ Нет (удалено) | ✅ Да (по offset) |
| **Latency** | Очень низкая (~1ms) | Немного выше |
| **Сложность** | Проще в настройке | Сложнее (брокеры, репликация) |

**Когда RabbitMQ:**
- Задачи на обработку с подтверждением (работа/оплата/уведомления)
- Сложный routing по условиям
- Нужна низкая задержка
- Масштаб: тысячи сообщений в секунду

**Когда Kafka:**
- Event Sourcing / Event Streaming
- Нужно воспроизвести историю событий (аудит, replay)
- Несколько независимых подписчиков одного потока
- Очень большой поток данных (логи, метрики, IoT)
- Связь между микросервисами в масштабе

---

## 5. Паттерны и продвинутые темы

### Idempotent Consumer (идемпотентный потребитель):
```
Проблема: At-least-once = возможны дубликаты сообщений.
Решение: Потребитель должен быть идемпотентным — обработка одного
         сообщения дважды даёт тот же результат.
```
```java
@KafkaListener(topics = "orders")
public void processOrder(OrderEvent event) {
    // Проверяем, не обрабатывали ли уже это событие
    if (processedEventsRepository.existsById(event.getEventId())) {
        log.warn("Duplicate event {}, skipping", event.getEventId());
        return;
    }
    orderService.process(event);
    processedEventsRepository.save(new ProcessedEvent(event.getEventId()));
}
```

### Outbox Pattern (паттерн исходящих сообщений):
```
Проблема: Сохранить в БД И отправить в Kafka атомарно невозможно (разные транзакции).
Если БД сохранила, но Kafka упала → событие потеряно.

Решение: Outbox Table
1. В той же транзакции с основными данными → пишем в таблицу outbox (в БД)
2. Отдельный процесс (Outbox Processor) читает из outbox и публикует в Kafka
3. После успешной публикации → помечает запись как отправленную
```

### Saga Pattern (для распределённых транзакций):
```
Microservice A → Microservice B → Microservice C
Если B упал → нужно откатить A (Compensating Transaction)

Choreography: Каждый сервис публикует события → следующий подписывается
Orchestration: Centralized Saga Orchestrator управляет порядком шагов
```

---

## 6. Типичные вопросы интервью

**Q: Что такое Consumer Group в Kafka?**
A: Группа потребителей, совместно читающих топик. Каждая партиция назначается ровно одному потребителю из группы. Разные группы читают один и тот же топик независимо — каждая со своим offset.

**Q: Как Kafka гарантирует порядок сообщений?**
A: Порядок гарантирован только внутри одной партиции. Для глобального порядка — один producer, одна партиция (но тогда нет параллелизма).

**Q: Что произойдёт если Consumer упадёт без ACK в RabbitMQ?**
A: Сообщение вернётся в очередь и будет доставлено другому потребителю (если используется manual ACK).

**Q: Что такое Partition Key в Kafka?**
A: Ключ, по которому producer определяет в какую партицию отправить сообщение (`hash(key) % numPartitions`). Все сообщения с одинаковым ключом попадают в одну партицию → гарантия порядка для конкретной сущности.

**Q: Как работает Dead Letter Queue?**
A: DLQ — специальная очередь для сообщений, которые не удалось обработать (превышено число попыток, истёк TTL, NAK с requeue=false). Позволяет не терять "проблемные" сообщения и разбирать их вручную.

**Q: В чём разница `acks=0`, `acks=1`, `acks=all` в Kafka?**
A: `0` — producer не ждёт подтверждения (возможна потеря). `1` — лидер партиции подтвердил запись (потеря при падении лидера до репликации). `all` — все реплики подтвердили (максимальная надёжность).
