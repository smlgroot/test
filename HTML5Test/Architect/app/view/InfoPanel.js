/*
 * File: app/view/InfoPanel.js
 *
 * This file was generated by Sencha Architect version 2.0.0.
 * http://www.sencha.com/products/architect/
 *
 * This file requires use of the Sencha Touch 2.0.x library, under independent license.
 * License of Sencha Architect does not include license for Sencha Touch 2.0.x. For more
 * details see http://www.sencha.com/license or contact license@sencha.com.
 *
 * This file will be auto-generated each and everytime you save your project.
 *
 * Do NOT hand edit this file.
 */

Ext.define('MyApp.view.InfoPanel', {
    extend: 'Ext.Panel',
    alias: 'widget.infopanel',

    config: {
        items: [
            {
                xtype: 'textfield',
                id: 'estado',
                label: 'Estado',
                name: 'estado'
            },
            {
                xtype: 'textfield',
                label: 'Ciudad',
                name: 'ciudad'
            },
            {
                xtype: 'numberfield',
                label: 'CP',
                name: 'cp'
            },
            {
                xtype: 'textfield',
                label: 'Distrito',
                name: 'distrito'
            },
            {
                xtype: 'textfield',
                label: 'Sección',
                name: 'seccion'
            },
            {
                xtype: 'selectfield',
                label: 'Tipo Casilla',
                name: 'tipo-casilla',
                displayField: 'desc',
                store: 'tipoCasillaStore',
                valueField: 'id'
            }
        ]
    }

});