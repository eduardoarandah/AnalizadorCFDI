var app = new Vue({
    el: '#app',
    data: {
        cfdis: [],
        errores: []
    },
    mounted: function() {
        this.$refs.drop.addEventListener('dragover', this.handleDragOver, false);
        this.$refs.drop.addEventListener('drop', this.handleFileSelect, false);
    },
    computed: {
        total_suma: function() {
            var total = 0;
            for (var i = this.cfdis.length - 1; i >= 0; i--) {
                total += this.total(this.cfdis[i]);
            }
            return total;
        },
        total_impuestos_trasladados: function() {
            var total = 0;
            for (var i = this.cfdis.length - 1; i >= 0; i--) {
                total += this.cfdis[i].totalimpuestostrasladados;
            }
            return total;
        },
        cantidad: function() {
            return this.cfdis.length;
        }
    },
    methods: {
        handleDragOver: function(evt) {
            evt.stopPropagation();
            evt.preventDefault();
            evt.dataTransfer.dropEffect = 'copy'; // Explicitly show this is a copy.
        },
        handleFileSelect: function(evt) {
            evt.stopPropagation();
            evt.preventDefault();
            var files = evt.dataTransfer.files; // FileList object.
            for (var i = 0, f; f = files[i]; i++) {
                var reader = new FileReader();
                // Closure to capture the file information.
                reader.onload = (cargarXML)(f);
                // Read in the image file as a data URL.
                reader.readAsText(f);
            }            
        },
        total: function(item) {
            var suma = 0;
            for (var i = item.conceptos.length - 1; i >= 0; i--) {
                suma += item.conceptos[i].importe;
            }
            return suma;
        },
        agregar:function(item){
            //borrar si es que estuviera duplicado
            var arr=this.cfdis.filter(function(el){
                return el.archivo!=item.archivo;
            });
            arr.push(item);
            this.cfdis=arr;
        }
    }
});