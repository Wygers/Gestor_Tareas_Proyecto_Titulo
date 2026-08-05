🌐 Plataforma Web para la Gestión y Control de Tareas Operativas en Organizaciones
Sistema web orientado a optimizar la planificación, asignación, supervisión y seguimiento de tareas operativas dentro de organizaciones, permitiendo mejorar la productividad, trazabilidad y control de procesos internos.

📌 Introducción
Actualmente muchas organizaciones presentan dificultades en el control y seguimiento de tareas operativas debido al uso de herramientas manuales, registros dispersos o falta de centralización de información. Esto genera retrasos, duplicidad de actividades, poca trazabilidad y dificultades en la supervisión del trabajo realizado.

La presente propuesta plantea el desarrollo de una plataforma web que permita administrar proyectos, tareas, responsables, seguimientos y evidencias desde un entorno centralizado, facilitando la comunicación y el monitoreo continuo de las actividades organizacionales.

🎯 Objetivo General
Desarrollar una plataforma web para la gestión y control de tareas operativas en organizaciones, permitiendo administrar usuarios, proyectos, actividades, seguimientos y alertas mediante un entorno centralizado y colaborativo.

✅ Objetivos Específicos
Gestionar usuarios y roles dentro del sistema.

Administrar proyectos y tareas operativas.

Controlar estados, prioridades y avances de tareas.

Registrar seguimientos, comentarios y evidencias.

Generar alertas y notificaciones automáticas.

Mantener auditoría de acciones realizadas.

👥 Roles del Sistema
Rol	Funciones
Administrador	Control total de usuarios, proyectos y configuraciones
Supervisor	Supervisa tareas, asigna responsables y valida avances
Técnico/Ejecutor	Ejecuta tareas y registra seguimientos
Visualizador	Consulta información y reportes
📂 Módulos del Sistema
🔐 Gestión de Usuarios
Permite registrar, editar y administrar usuarios del sistema, así como asignar roles y permisos según el nivel de acceso correspondiente.

📋 Gestión de Proyectos
Facilita la creación y administración de proyectos operativos dentro de la organización.

📝 Gestión de Tareas
Permite crear tareas, asignar responsables, establecer prioridades, fechas y estados de ejecución.

📊 Seguimiento Operativo
Registra avances, observaciones y cambios realizados sobre las tareas asignadas.

📎 Evidencias y Documentación
Permite adjuntar archivos y evidencias relacionadas con el cumplimiento de actividades.

🔔 Alertas y Notificaciones
Genera avisos automáticos sobre vencimientos, retrasos y cambios importantes.

📜 Auditoría
Mantiene registro histórico de las acciones realizadas por los usuarios dentro del sistema.

📐 Diagramas del Sistema
1. Diagrama de Casos de Uso
El siguiente diagrama representa la interacción entre los usuarios y las funcionalidades principales de la plataforma.
<img width="709" height="1367" alt="image" src="https://github.com/user-attachments/assets/d3c5a2c5-d112-4beb-b917-9c9ae56b4e64" />
📖 Justificación del Diagrama de Casos de Uso
El diagrama de casos de uso permite identificar las funcionalidades principales del sistema y la interacción de cada rol con la plataforma.

El administrador posee control total sobre la gestión de usuarios, roles, organizaciones y auditorías, garantizando la administración general del sistema. El supervisor se encarga de coordinar y supervisar tareas operativas, asignando responsables y validando avances. El ejecutor desarrolla las actividades asignadas y registra seguimientos, evidencias y comentarios. Finalmente, el visualizador únicamente consulta información y reportes sin modificar datos.

Este modelo establece claramente los permisos y responsabilidades de cada usuario dentro de la organización, siguiendo una jerarquía de permisos donde cada rol hereda funcionalidades del nivel inferior.

2. Diagrama de Clases
El siguiente diagrama representa la estructura lógica de las entidades principales del sistema y sus relaciones.
<img width="1378" height="1269" alt="image" src="https://github.com/user-attachments/assets/a92679df-fc13-4263-a897-0ca31c7b7483" />
3. Diagrama Entidad-Relación (DER)
<img width="2245" height="1115" alt="image" src="https://github.com/user-attachments/assets/57a3bd5f-7148-44f7-91f3-21be65c09850" />
📖 Justificación del Modelo Entidad-Relación
El modelo Entidad-Relación presentado constituye la columna vertebral del sistema, diseñado bajo los principios de normalización hasta la Tercera Forma Normal (3NF) para garantizar:

-Integridad Referencial: Todas las relaciones están definidas mediante claves foráneas que mantienen la consistencia de los datos.

-Escalabilidad: La organización como entidad principal permite un modelo multi-tenant donde cada organización opera de forma aislada.

-Auditoría Completa: Tabla LOGS_SISTEMA con almacenamiento JSON para trazabilidad total.

-Seguridad: Control de intentos fallidos y bloqueo de usuarios. Campos de activo para eliminación lógica.

-Flexibilidad Operativa: Estados y prioridades configurables. Sistema de categorías adaptable.

4. Diagrama de Secuencia
<img width="638" height="714" alt="image" src="https://github.com/user-attachments/assets/8fcf0b81-faf3-4f59-86eb-ed78a819f6c5" />
📖 Justificación del Diagrama de Secuencia
El diagrama de secuencia representa el flujo dinámico de operaciones dentro de la plataforma. El proceso inicia cuando el supervisor accede al sistema y crea una nueva tarea. El sistema valida los permisos, registra la información en la base de datos y genera una notificación para el técnico.
El técnico accede al sistema, visualiza sus tareas asignadas y procede a actualizar el avance. Cada acción es registrada en la base de datos, manteniendo un control continuo.

🗄️ Modelo de Base de Datos
Entidades Principales
Entidad	Descripción
Organización:	Entidad raíz que agrupa a todos los usuarios, proyectos y tareas
Usuario:	Personas que interactúan con el sistema, con roles y permisos
Tarea:	Actividad operativa con fechas, prioridad, estado y responsables
Categoría:	Clasificación de tareas según su naturaleza
Prioridad:	Nivel de urgencia (Baja, Media, Alta, Crítica)
Estado:	Etapa del flujo de trabajo
Asignación:	Registro de asignación a técnicos y supervisores
Evidencia:	Documentación y archivos adjuntos
Comentario:	Interacciones y notas adicionales
Alerta:	Notificaciones sobre eventos relevantes
Auditoría:	Registro histórico de acciones

💻 Tecnologías Utilizadas
Tecnología	Función
Node.js	Desarrollo backend
Express.js	Framework del servidor
MySQL	Gestión de base de datos
Bootstrap	Diseño responsivo
EJS	Motor de vistas
JavaScript	Lógica del sistema
GitHub	Control de versiones
JWT	Autenticación y seguridad
Nodemailer	Envío de notificaciones por email
📊 Beneficios de la Plataforma
✅ Centralización de información operativa
✅ Mejor control y supervisión de tareas
✅ Incremento de productividad organizacional
✅ Reducción de retrasos y pérdida de información
✅ Automatización de alertas y seguimientos
✅ Mejor comunicación entre áreas de trabajo
✅ Trazabilidad completa de actividades
✅ Toma de decisiones basada en datos

📈 Resultado Esperado
La implementación de la plataforma permitirá optimizar la gestión y control de tareas operativas en organizaciones mediante un entorno web centralizado, facilitando la planificación, supervisión y seguimiento de actividades, mejorando la productividad y fortaleciendo la toma de decisiones organizacionales.

👨‍💻 Autor
Tesis presentada para optar al título de: Vicente Alfredo Bravo Romero
