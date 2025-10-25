# Love Letters – Proyecto de Ciberseguridad

Este proyecto forma parte de la Unidad I – Fundamentos de la Ciberseguridad de la materia Ciberseguridad aplicada a los negocios en la Universidad Tecnológica de Coahuila.

## Objetivo

El alumno determinará las principales técnicas y herramientas para el intercambio de información segura.

## Descripción del Proyecto

Love Letters es una aplicación web que permite enviar mensajes cifrados y verificar su integridad mediante una firma digital simulada. El sistema utiliza cifrado AES y hash SHA-256 para garantizar la confidencialidad e integridad de los datos.

## Herramientas de Protección de Datos

- CryptoJS AES: para cifrar y descifrar mensajes.
- CryptoJS SHA-256: para generar una firma digital simulada.
- HTML/CSS/JavaScript: para la interfaz y lógica del sistema.

Estas herramientas fueron seleccionadas por su robustez, disponibilidad en entornos web y alineación con los estándares de seguridad digital.

## Flujo de Intercambio Seguro

1. El usuario escribe un mensaje y una clave personalizada.
2. El mensaje se cifra con AES y se genera una firma digital con SHA-256.
3. Se crea un enlace que contiene el paquete cifrado.
4. El receptor introduce la clave para descifrar el mensaje.
5. El sistema verifica la firma digital para asegurar la integridad.

Este flujo simula un protocolo seguro de intercambio de información, cumpliendo con los principios de la triada CID: Confidencialidad, Integridad y Disponibilidad.

## Certificados Digitales

Aunque no se usan certificados X.509 reales, el sistema simula una firma digital mediante SHA-256, lo que permite validar la autenticidad e integridad del mensaje. Esta simulación cumple con los conceptos fundamentales de los certificados digitales.

## Pruebas

Puedes probar el sistema abriendo `index.html` para crear un mensaje cifrado y luego `recibir.html` para descifrarlo. Se requiere la misma clave para recuperar el mensaje original.

## Autora

Princess

## Licencia

Este proyecto es educativo y puede ser reutilizado con fines académicos. No se recomienda para entornos de producción sin mejoras de seguridad adicionales.
