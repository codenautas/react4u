# colecciones para react y redux

## los datos

Por ejemplo tenemos una lista de países. Los países tienen una lista de aeropuertos. 
  - Cada país tiene un código [ISO_3166-1](https://es.wikipedia.org/wiki/ISO_3166-1) y los aeropuertos un código [IATA](https://es.wikipedia.org/wiki/C%C3%B3digo_de_aeropuertos_de_IATA). 
  - La lista de países tiene un orden particular para mostrarse (quizás alfabético, quizás separado por continente)
  - La lista de aeropuertos dentro de cada país también tiene un órden de despliegue

## la necesidad

Queremos economía en el modelo de datos, en el código y eficiencia en el acceso y recorrido. Necesitamos

  - Recorrer las listas para el despliegue `React`
  - Hacer un `redux` eficiente si queremos cambiar un dato en un solo país o en un solo aeropuerto. 
  - Que no haya duplicidad de almacenamiento
  - Poder serializar la información (JSON)

## posibilidades

1. **Array**. Que las listas estén en arreglos ordenados por su despliegue, que las acciones redux conozcan el código:
   - **despliegue react**: eficiente, elegante `lista.forEach`.
   - **redux**: ineficiente, poco expresivo, se necesita un map con un if: `lista.map(x => x.codigo == codigo?nuevoX:x)`.
   - **modelo de datos**: inseguro, no impide la duplicidad de códigos.
   - **orden de despliegue**: implícito en el modelo de datos (puede venir dado desde el backend o la base de datos)

2. **Objeto indexado por código**. Que las listas sean objetos Javascript cuya clave sea el código:
   - **despliegue react**: ineficiente, poco elegante se debe ordenar antes del despliegue.
   - **redux**: eficiente, expresivo, se puede cambiar el dato usando el *spread operator*: `{...lista, [codigoDato]:nuevoDato}`.
   - **modelo de datos**: seguro, impide la duplicidad de códigos
   - **orden de despliegue**: el cliente debe conocer el criterio de ordenación y el *colate*


