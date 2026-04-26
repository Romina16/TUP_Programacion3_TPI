//Aquí irá la lógica de renderizado

const cargarCategorias = () => {
    const contenedor = document.getElementById("lista-categorias");
    categorias.forEach(cat => {

        const li = document.createElement("li");
        li.innerHTML = `<a href="#">${cat.nombre}</a>`;
        contenedor.appendChild(li);
    });
}

const cargarProductos = () => {

    const contenedorProductos = document.getElementById("contenedor-productos");

    productos.forEach(producto => {

        const article = document.createElement("article"); //creacion de nodo article

        article.classList.add("tarjeta-producto") //aplico estilo de tarjeta-producto

        article.innerHTML = `
        <img src= "${producto.imagen}" alt ="${producto.nombre}">
        <h3>${producto.nombre}</h3>
        <p>${producto.descripcion}</p>
        <p class ="precio">$${producto.precio}</p>
        <button class="btn-agregar">Agregar</button>
        `;

        const boton = article.querySelector(".btn-agregar");
        boton.addEventListener("click", () => {
            alert(`Seleccionaste: ${producto.nombre}`);
        })

        contenedorProductos.appendChild(article);
    })
}


//Mostrar el contenido
cargarCategorias();
cargarProductos();