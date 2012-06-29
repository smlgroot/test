/*
 * File: app/view/MainTabPanel.js
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

Ext.define('MyApp.view.MainTabPanel', {
    extend: 'Ext.tab.Panel',
    requires: [
        'MyApp.view.InfoPanel',
        'MyApp.view.VotosPanel',
        'MyApp.view.FotoPanel',
        'MyApp.view.EnviarPanel'
    ],

    config: {
        items: [
            {
                xtype: 'container',
                title: 'Info',
                iconCls: 'home',
                items: [
                    {
                        xtype: 'infopanel'
                    }
                ]
            },
            {
                xtype: 'container',
                title: 'Votos',
                iconCls: 'compose',
                items: [
                    {
                        xtype: 'votospanel'
                    }
                ]
            },
            {
                xtype: 'container',
                title: 'Foto',
                iconCls: 'user',
                items: [
                    {
                        xtype: 'fotopanel'
                    }
                ]
            },
            {
                xtype: 'container',
                title: 'Send',
                iconCls: 'action',
                items: [
                    {
                        xtype: 'enviarpanel'
                    }
                ]
            },
            {
                xtype: 'toolbar',
                docked: 'top',
                items: [
                    {
                        xtype: 'button',
                        docked: 'right',
                        iconCls: 'settings',
                        iconMask: true
                    }
                ]
            }
        ],
        tabBar: {
            docked: 'bottom'
        }
    }

});