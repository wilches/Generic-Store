//Este archivo es sólamente usado para separar el ejs y js de ventas

//Variables generales de ids:
var idBtnConsultClient = '#btn-consult-client';
var idInputCedulaClient = '#cedula';
var idInputNameClient = '#cliente';
var idDivConsecutive = '#consecutivo';

var idMolde = '#template-products';
var idListProducts = '#content-products';
var idBtnSale = '#sendSale';

//variables generales, tipos de atributos para los inputs de productos:
var attrName = 'name_product';
var attrCode = 'code_product';
var attrAmount = 'amount_product';
var attrValue = 'value_product';
var attrBtnSearch = 'btn_search';
var attrBtnAdd = 'btn_add';
var attrBtnRemove = 'btn_delete';

var idTotalSale = '#total_venta';
var idTotalIva = '#total_iva';
var idFinalSale = '#total_con_iva';


$(document).ready( ()=>
{
    $.get('ventas/getConsecutive').then( (res)=>{ $(idDivConsecutive).val(res); });
    
    //Cremos por defecto un campo para el producto:
    createNewRegister();

    //EVENTOS:
    //Cuándo se desee consultar un usuario:
    $(idBtnConsultClient).click( getClient );

    //Para el registro de productos:
    $(document).on('click', 'button[typeValue='+attrBtnSearch+']', getProduct);
    $(document).on('change keyup', 'input[typeValue='+attrAmount+']', newPrice);
    //$(document).on('change', 'input[typeValue='+attrValue+']', changeTotals);
    $(document).on('click', 'button[typeValue='+attrBtnAdd+']', saveProduct);
    $(document).on('click', 'button[typeValue='+attrBtnRemove+']', deleteProduct);

    //Enviar venta:
    $(idBtnSale).click( sendSale );
});


/**
 * Obtiene un cliente e imprime su nombre en el campo.
 * Si no existe, retorna respuesta de error.
 */
function getClient(){
    let id = $(idInputCedulaClient).val();
    let divNameCliente = $(idInputNameClient);

    $.post('/clientes/search', {id}, (res)=>{
        if(!res.success){
            toastr['error'](res.msj, 'Error ocurrido');
            divNameCliente.val('');
        }
        else divNameCliente.val(res.client.name);
    });
}


/**
 * Opera los niveles de jerarquia para obtener el registro que contiene ese botón
 * @param {HTMLElement} btn botón desde donde iniciará la busqueda de jerarquia
 * @returns el contenedor padre tr.
 */
 function getBtnToParent(btn){
    return btn.parent().parent().parent();
}


/**
 * Función llamada en los eventos, busca el código de un registro
 * y en caso de existir un producto con ese código, lo imprime.
 * de otro modo, resetea los campos de ese registro.
 */
function getProduct(){
    //Obtengo el padre del registro:
    let parent = getBtnToParent($(this));
    //Obtengo la id del producto:
    let id = parent.find('input[typeValue='+attrCode+']').val();

    //Obtengo los divs y ejecuto la consulta por post:
    let inputName = parent.find('input[typeValue='+attrName+']');
    let inputAmount = parent.find('input[typeValue='+attrAmount+']');
    let inputValue = parent.find('input[typeValue='+attrValue+']');

    $.post('/productos/search', {id}, (res)=>{
        //doy los valores en los divs, si es undefined el me pondrá '' o null.
        if(res.success === 1) res = res.product;
        else toastr.error(res.msj, res.title);

        inputName.val(res.name);
        inputAmount.val(res.price ? 1 : null);
        inputValue.attr('price_unit', res.price ? res.price : '');
        inputValue.attr('iva', res.iva ? res.iva : '');
        inputValue.val(res.price);
    });
}

/**
 * Modifica el precio del producto, dependiendo la cantidad de unidades en su registro
 * Función llamada en los eventos declarados.
 */
function newPrice(){
    let parent = getBtnToParent( $(this).parent() );
    let amount = $(this).val();

    let divValue = parent.find('input[typeValue='+attrValue+']');
    divValue.val( amount * divValue.attr('price_unit') );
}



/**
 * Función llamada desde los eventos.
 * Guarda la información de un producto y genera otra casilla
 * para registrar otro.
 */
function saveProduct(){
    let btn = $(this);
    let parent = getBtnToParent(btn);
    let json = allCompleteProduct( parent );

    if( json.value === 'success' ){
        //Generamos ahora, la función de eliminar:
        btn.attr('typeValue', attrBtnRemove);
        btn.html('<i class="fas fa-trash-alt"></i>');
        //Y deshabilitamos la edición de ese registro:
        parent.find('input[typeValue='+attrCode+']').prop('readonly', true);
        parent.find('button[typeValue='+attrBtnSearch+']').remove();
        parent.find('input[typeValue='+attrAmount+']').prop('readonly', true);
    
        //añadimos un nuevo registro:
        createNewRegister();
        //Actualizamos las ventas:
        changeTotals();
    }
    else toastr[json.value](json.msj, json.title);
}

/**
 * Función llamada desde los eventos.
 * Elimina un producto.
 */
function deleteProduct(){
    deleteRegisterProduct( getBtnToParent($(this)) );
    //Actualizamos las ventas
    changeTotals();
}

/**
 * Crea una nueva sección de producto.
 * @returns Retorna el elemento creado.
 */
function createNewRegister(){
    //Variables iniciales:
    let molde = $(idMolde).find('tr:first-child').clone();   //Plantilla de registro por producto.
    let listProducts = $(idListProducts);   //tbody donde se almacenará cada registro de producto.

    //Asignamos a la casilla de scope el valor del registro:
    molde.find('th').text( listProducts.find('tr').length+1 );

    listProducts.append(molde);
    return molde;
}

/**
 * Elimina un registro de la tabla donde aparecen los productos
 * y actualizo el número de los otros registros.
 * @param {HTMLDivElement} registro 
 */
function deleteRegisterProduct(registro){
    let consecutive = registro.find('th').text();   //consecutivo del registro a eliminar
    let divParent = registro.parent();              //contenedor:
    registro.remove();                              //remuevo el registro

    let recordsList = divParent.find('tr th');      //Tomo la lista de registros actuales
    let size = recordsList.length                   //Número de productos en pantalla.

    //Para los elementos siguientes del eliminado vamos a cambiar el número de registro.
    for(i=consecutive-1; i<size; i++) recordsList[i].innerHTML = i+1;
}

/**
 * Valida si en ese registro los campos se encuentran correctamente diligenciados.
 * @param {HTMLElement} product registro de producto. 
 * @returns {JsonObject} retorna respuesta que tiene inicialmente value:[error,success,warning] y un mensaje.
 */
function allCompleteProduct(product){
    //Mensaje de retorno
    const json = {value:'error', title:'Ha ocurrido un error.', msj:''};

    if( product.find('input[typeValue='+attrCode+']').val() === '' ) json.msj = 'Falta declarar el código del producto.';
    else if( product.find('input[typeValue='+attrName+']').val() === '' ) json.msj = 'Favor presione la lupa para buscar el producto.';
    else if( product.find('input[typeValue='+attrAmount+']').val() < 1 ) json.msj = 'La cantidad del producto no puede ser menor a 1.';
    else json.value = 'success';

    return json;
}

/**
 * Valida todos los registros y me da unos totales:
 */
function changeTotals(){
    //contiene todos los productos:
    let listProducts = $(idListProducts+' tr');
    //Totales:
    let totals = {totalSale: 0, totalIva:0};

    for(i=0; i < listProducts.length-1; i++){
        register = $(listProducts[i]);
        let divSale = register.find('input[typeValue='+attrValue+']');
        let value = new Number( divSale.val() );

        totals.totalSale += value;
        totals.totalIva += value*(divSale.attr('iva')/100);
    }


    $(idTotalSale).val(totals.totalSale.toFixed(2));
    $(idTotalIva).val(totals.totalIva.toFixed(2));
    $(idFinalSale).val( (totals.totalSale +totals.totalIva).toFixed(2) );
}

/**
 * Función llamada desde los eventos
 * Valida que exista un cliente y al menos un producto
 * Si es así, envia a la db la venta realizada y retorna una respuesta.
 * De lo contrario, simplemente dice el error.
 */
function sendSale(){
    let id_client = $(idInputCedulaClient).val();
    let list_products = $(idListProducts+' tr');

    if( !id_client || !$(idInputNameClient).val() ) toastr.error('Favor declarar el cliente');
    else if( list_products.length < 2 ) toastr.error('Minimo declare un producto de compra.');
    else
    {
        let products = [];
        for(i=0; i < list_products.length-1; i++){
            let register = $(list_products[i]);
            products.push({
                code: register.find('input[typeValue='+attrCode+']').val(),
                amount: register.find('input[typeValue='+attrAmount+']').val()
            });
        }

        $.ajax({
            type: 'POST',
            url: 'ventas/create',
            data: { id_client, products: JSON.stringify(products) },
            success: function(res){
                //mostramos toast:
                let value = res.success ? 'success' : 'error';
                toastr[value](res.msj);

                if(res.success){
                    //Seteamos el consecutivo:
                    $.get('ventas/getConsecutive').then( (res)=>{ $(idDivConsecutive).val(res); });
                    //Seteamos los valores del cliente;
                    $(idInputCedulaClient).val('');
                    $(idInputNameClient).val('');

                    //Seteamos la lista de productos:
                    $(idListProducts).html('');
                    //Cremos por defecto un campo para el producto:
                    createNewRegister();
                    //Seteamos los totales:
                    changeTotals();
                }
            },
            error: function(jqXHR, textStatus, errorThrown){
                toastr.error('Error encontrado: '+errorThrown);
            }
        });
    }
}