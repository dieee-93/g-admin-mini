# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - generic [ref=e2]:
    - generic [ref=e4]:
      - heading "¡Oops! Algo salió mal" [level=2] [ref=e5]
      - paragraph [ref=e6]: Ha ocurrido un error inesperado. Nuestro equipo ha sido notificado automáticamente.
      - paragraph [ref=e7]: "ID de error: 9733fc54-ec88-4b5d-b25b-0de877a4d37c"
      - generic [ref=e8]:
        - button "Intentar de nuevo" [ref=e9] [cursor=pointer]
        - button "Reportar error" [ref=e10] [cursor=pointer]
      - group [ref=e11]:
        - generic "Ver detalles del error (desarrollo)" [ref=e12] [cursor=pointer]
    - generic [ref=e13]:
      - img [ref=e15]
      - button "Open Tanstack query devtools" [ref=e63] [cursor=pointer]:
        - img [ref=e64]
  - region "bottom-end Notifications alt+T"
```