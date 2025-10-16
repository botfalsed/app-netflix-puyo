# SafeArea Management - Netflix Clone

## Problema Resuelto

El problema de que los elementos del header se superpongan con la barra de estado ha sido solucionado implementando un sistema de manejo de áreas seguras consistente en toda la aplicación.

## Componente SafeAreaWrapper

Se ha creado un componente reutilizable `SafeAreaWrapper` que maneja automáticamente las áreas seguras en todos los dispositivos.

### Ubicación
```
frontend/components/common/SafeAreaWrapper.tsx
```

### Uso Básico

```tsx
import SafeAreaWrapper from '../common/SafeAreaWrapper';

function MyScreen() {
  return (
    <SafeAreaWrapper>
      {/* Tu contenido aquí */}
    </SafeAreaWrapper>
  );
}
```

### Propiedades Disponibles

- `backgroundColor`: Color de fondo (default: '#000')
- `statusBarStyle`: Estilo de la barra de estado ('light-content' | 'dark-content')
- `statusBarBackgroundColor`: Color de fondo de la barra de estado (default: 'transparent')
- `edges`: Qué bordes proteger (['top', 'bottom', 'left', 'right'])

### Ejemplo Avanzado

```tsx
<SafeAreaWrapper 
  backgroundColor="#000" 
  statusBarStyle="light-content"
  edges={['top', 'bottom']}
>
  {/* Contenido */}
</SafeAreaWrapper>
```

## Configuración Global

El `SafeAreaProvider` se ha configurado en `app/_layout.tsx` para que esté disponible en toda la aplicación.

## Beneficios

1. **Consistencia**: Mismo comportamiento en todas las pantallas
2. **Mantenibilidad**: Un solo lugar para cambiar el comportamiento de áreas seguras
3. **Flexibilidad**: Personalizable por pantalla según necesidades
4. **Compatibilidad**: Funciona en iOS, Android y diferentes tamaños de pantalla

## Migración de Pantallas Existentes

Para migrar pantallas existentes:

1. Importar `SafeAreaWrapper`
2. Reemplazar `SafeAreaView` o contenedores principales
3. Remover manejo manual de `StatusBar` si existe
4. Ajustar estilos si es necesario

## Ejemplo de Migración

**Antes:**
```tsx
<SafeAreaView style={{flex: 1, backgroundColor: '#000'}}>
  <StatusBar barStyle="light-content" />
  {/* contenido */}
</SafeAreaView>
```

**Después:**
```tsx
<SafeAreaWrapper backgroundColor="#000" statusBarStyle="light-content">
  {/* contenido */}
</SafeAreaWrapper>
```