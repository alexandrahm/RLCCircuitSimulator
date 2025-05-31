# Simulador de Circuito RLC

Este proyecto es un simulador interactivo de circuitos RLC desarrollado en React para el proyecto de Ecuaciones diferenciales.

# Alumnos
- Alexandra Henríquez - HM232507​
- Vanessa Velasco – VG180754​
- César Reglado - RV210723
- Saul Menjivar - MM190788 
- Andrés Gutierrez - EG241196 

## Catedrático

 Ing. Joel Orellana - Universidad Don Bosco

## Características

- Simulación en tiempo real de circuitos RLC
- Cálculo de corriente en tiempos específicos
- Visualización gráfica de la respuesta del circuito


## Instalación

1. Extraiga todos los archivos en una carpeta
2. Abra una terminal en la carpeta del proyecto
3. Ejecute: `npm install`
4. Para iniciar la aplicación: `npm start`

## Uso

1. Ingrese los parámetros del circuito (L, R, C, E)
2. Establezca las condiciones iniciales si es necesario
3. Observe la gráfica de corriente vs tiempo
4. Consulte valores específicos ingresando el tiempo deseado

## Ecuación Diferencial

El simulador resuelve la ecuación:
L(d²q/dt²) + R(dq/dt) + q/C = E(t)

Donde i = dq/dt (corriente = derivada de la carga)
