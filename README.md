## __Introducción__
>
> Este repositorio tiene como objetivo dar a conocer las distintas herramientas que se pueden utilizar al momento de construir un sistema distribuido. En este caso, se implementa un sistema de búsqueda, que consta de 4 módulos que ejecutan las herramientas que permiten la comunicación y ejecución de cada uno de estos contenedores de manera descentralizada. Díchos módulos son:
>
>1. Caché
>2. Base de datos
>3. Cliente
>4. Servidor
>
>El objetivo principal de este Sistema es poder brindar una única respuesta a una consulta, pero ejecutando varias acciones y verificaciones de manera coordinada y maquillando la descentralización de las máquinas para poder representarlas como un solo módulo.

___

## __Módulos__

>### __Caché__
>
>Redis es un almacén de estructura de datos de valores de clave en memoria rápido y de código abierto.
>
>Se utiliza en este Sistema para almacenar datos en caché(búsqueda,resultado) y así intervenir de alguna manera las llamadas hacia la base de datos, disminuyendo la cantidad de consultas y por consiguiente la carga generada sobre ella.
>
>
> - Nombre del servicio
>   - redis
> - Nombre del contenedor Docker
>   - cache
> - Imagen utilizada en el contenedor Docker
>   - redis:6.2.6
> - Puerto en la máquina principal:
>   - 8031
> - Puerto en el contenedor:
>   - 6379
> - Variables de entorno:
>   - ALLOW_EMPTY_PASSWORD=yes
> - Configuración inicial
>   - Memoria máxima : 2MB
>   - Política de remoción: Least recentrly used
>
>
> ```
>redis:
>    container_name: cache
>    image: redis:6.2.6
>    restart: always
>    ports:
>        - "8031:6379"
>    environment:
>      - ALLOW_EMPTY_PASSWORD=yes
>    command: ["redis-server", "--bind", "redis",   "--maxmemory 2mb","--maxmemory-policy allkeys-lru"]
>```
>
>#### __Tabla comparativa__
>
>| __Least Recently Used (LRU)__                                                                                                                                                                                                                          | __Least Frequently Used (LFU)__                                                                                                                 |
>------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |------------------------------------------------------------------------------------------------------------------------------------------------ |
>| _Utiliza un TTL o bits de edad que indican exactamente cuándo se accedió al elemento por última vez, generando un orden de más usados a menos usados. Cuando se elimina una entrada, le tiempo de vida del resto de las entradas almacenadas cambia._  | _Utiliza un contador para realizar un seguimiento de la frecuencia con la que se accede a una entrada._                                         |
>| _Cuando se alcance el límite de la memoria caché, los elementos a los que se no se haya accedido por más tiempo se eliminarán desde la parte inferior de la memoria caché._                                                                            | _Entrada con el recuento de frecuencia más bajo se elimina._                                                                                    |
>| _Este método no se usa con tanta frecuencia, ya que no tiene en cuenta un elemento que inicialmente tuvo una tasa de acceso alta y luego no se accedió durante mucho tiempo._                                                                          | _Este puede ser un algoritmo costoso de usar, ya que necesita mantener "bits de edad" que muestren exactamente cuándo se accedió al elemento._  |
>
> Nosotros, en este servicio, utilizamos la política `LRU` ya que si pensamos en un servicio de compras, lo primordial es saber qué es lo que más se busca o se vende en la actualidad. No nos interesa un histórico de los más buscado (para las políticas). Con esto queremos decir que lo más relevante o más buscado siempre se mantendrá en la memoria de acceso rápido, mientras que para un producto no tan cotizado o simplemente sin demanda en el presente, no es necesario almacenarla.

>### __Base de datos__
>
>Es evidente que un sistema de búsqueda necesita información para realizar dicha acción, por lo que es necesario una base de datos para almacenar dichos datos.
>
>Se nos hizo entrega de un archivo `init.sql` el cual contiene los datos a utilizar y es disponibilizado con `PostgreSQL` en un contenedor Docker.
> Su definición en el archivo `docker-compose.yml`
>
> - Nombre del servicio
>   - _postgres_
> - Imagen utilizada en el contenedor Docker
>   - _Bitnami postrges versión 11_
> - Volumen de inicio:
>   - _Archivo `init.sql`
> - Puerto en la máquina principal:
>   - _5432_
> - Puerto en el contenedor:
>   - _5432_
> - Variables de entorno:
>   - POSTGRESQL_USERNAME=postgres
>   - POSTGRESQL_DATABASE=tiendita
>   - ALLOW_EMPTY_PASSWORD=yes
>   - POSTGRESQL_PASSWORD=marihuana
>
> A continuación, descripción del servicio en el archivo `docker-compose.yml`
>
>```
>postgres:
>    image: docker.io/bitnami/postgresql:11
>    volumes:
>      - ./Database/db/init.sql:/docker-entrypoint-initdb.d/init.sql
>    environment:
>      - POSTGRESQL_USERNAME=postgres
>      - POSTGRESQL_DATABASE=tiendita
>      - ALLOW_EMPTY_PASSWORD=yes
>      - POSTGRESQL_PASSWORD=marihuana
>    ports:
>      - "5432:5432"
> ```

>### __Buscador API-REST__

>El módulo de búsqueda actúa sobre un servidor del Framework Node y express , el cuál recibe por parámetro POST() una palabra y luego mediante la búsqueda directa en el caché perteneciente al módulo redis es capaz de identificar si el par(llave,valor) existe en la base de datos de alta velocidad, o debe ir a buscar coincidencias a la base de datos de Postgresql mediante el módulo de grpc.
>
>Para efectuar una búsqueda solo basta usar un gestor de consultas tal como Postman, que permita consumir la api y enviar un Post a la siguiente url:
>
>- <http://localhost:3000/inventory/search?q>="query"
>
>y reemplazar el parámetro query por la búsqueda que se desea realizar, como por ejemplo:
>
>- <http://localhost:3000/inventory/search?q=Mens>
>

>### __Servidor grpc__

>El protocolo grpc es el encargado de serializar la información para ser enviada. Éste recibe una llamada de búsqueda proveniente del cliente, lo que gatilla una instrucción directa en la base de datos, la cual retorna un conjunto de datos dado un parámetro de entrada que son enviados de vuelta.

## __Ejecución el sistema__

>Para ejecutar el sistema, se utilizó la herramienta `Docker`, con la cual se encapsulan los servicios y se exponen un una red virtual de la misma.
>Para los módulos `Cliente` y `Servidor` se hizo el uso de un `Dockerfile` para cada uno que interactúa como un plano con el que se contruirá el contenedor a la hora de ejecutar un `compose`.
>
>Los pasos a seguir para ejecutar el sistema completo son los siguientes:
>
>   1. Clonar el repositorio en el equipo local.
>
>   2. Entrar en la carpeta del repositorio, donde se encuentra el archivo `docker-compose.yml`.
>
>   3. Ejecutar el comando `docker-compose up`.
>
>Una vez hecho esto, comenzará el proceso de construcción y ejecución del contenedor principal, que dentro tiene los 4 servicios encapsulados.
>
>Finalmente, se puede probar el servicio utilizando un gestor de consultas, haciendo una peticion `POST` a la dirección:
>
> - <http://localhost:3000/inventory/search?q>="query"
>
>Donde `query` corresponde a una palabra clave para la búsqueda de productos.
