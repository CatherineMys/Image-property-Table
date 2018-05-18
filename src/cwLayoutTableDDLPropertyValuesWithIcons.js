/* Copyright (c) 2012-2013 Casewise Systems Ltd (UK) - All rights reserved */
/*global cwAPI, jQuery*/

(function (cwApi, $) {
  'use strict';

  var cwLayoutTableDDLPropertyValuesWithIcons = function (options, viewSchema) {
    cwApi.extend(this, cwApi.cwLayouts.CwLayout, options, viewSchema);
    this.drawOneMethod = cwLayoutTableDDLPropertyValuesWithIcons.drawOne.bind(this);
    this.propertyManagers = {};
    cwApi.registerLayoutForJSActions(this);
    this.gridItems = {};
  };

  cwLayoutTableDDLPropertyValuesWithIcons.prototype.applyJavaScript = function () {
    return undefined;
  };


  cwLayoutTableDDLPropertyValuesWithIcons.getEditButton = function (trId, item) {

    var o = [],
      link, $td, otName, itemId;

    if (cwApi.isUndefined(item)) {
      $td = $('#' + trId + ' td:first');
      otName = $td.attr('data-objecttype-scriptname');
      itemId = $td.attr('data-item-id');
      item = {
        object_id: itemId
      };
      link = cwApi.createLinkForSingleView(otName, item);
    } else {
      link = cwApi.createLinkForSingleView(item.objectTypeScriptName, item);
    }
    o.push('<a id="', trId, '-open" class="cw-grid-action-button cw-grid-action-button-open" href="', link, '" title="', $.i18n.prop('layoutGrid_openLink'), '"><i class="fa fa-folder-open"></i></a>');
    return o.join('');
  };

  cwLayoutTableDDLPropertyValuesWithIcons.outputPropertiesGroups = function (output, schemaNode, item, propertyGroupContainer, outputMethod, objectTypeScriptName) {
    var propertiesGroups, pg, propertiesLength, i, propertyScriptName;
    propertiesGroups = schemaNode[propertyGroupContainer];
    for (pg in propertiesGroups) {
      if (propertiesGroups.hasOwnProperty(pg)) {
        propertiesLength = propertiesGroups[pg].properties.length;
        for (i = 0; i < propertiesLength; i += 1) {
          propertyScriptName = propertiesGroups[pg].properties[i];
          outputMethod(output, (item === null) ? schemaNode : item, propertyScriptName, false, objectTypeScriptName);
        }
      }
    }
  };



  cwLayoutTableDDLPropertyValuesWithIcons.drawOne = function (output, item) {
    var trId, assoKey, asso, layout, schemaNode, propertyNodeId, i, property, value, pScriptname, nodeSchema, assoCount, ddlPropertyScriptName, ddlPropertyOptionPairs, j, lSrc, lValue, pLength;

    schemaNode = cwApi.ViewSchemaManager.getNodeSchemaByIdForCurrentView(this.nodeID);
    //Cat was here
    ddlPropertyScriptName = schemaNode.LayoutOptions.CustomOptions['property-type'];
	ddlPropertyOptionPairs = JSON.parse(schemaNode.LayoutOptions.CustomOptions['value-pairs']);
    trId = 'cw-grid-action-item-row-' + item.object_id;
    output.push("<tr id='", trId, "'>");


    output.push('<td data-objecttype-scriptname="', item.objectTypeScriptName, '" data-item-id="', item.object_id, '">', cwLayoutTableDDLPropertyValuesWithIcons.getEditButton(trId, item), '</td>');
    for (propertyNodeId in schemaNode.PropertiesGroups) {
      if (schemaNode.PropertiesGroups.hasOwnProperty(propertyNodeId)) {
        for (i = 0; i < schemaNode.PropertiesGroups[propertyNodeId].properties.length; i += 1) {
          pScriptname = schemaNode.PropertiesGroups[propertyNodeId].properties[i];
          property = cwApi.mm.getProperty(item.objectTypeScriptName, pScriptname);
          value = cwApi.isNull(item) || cwApi.isUndefined(item.properties) ? cwApi.cwPropertiesGroups.getDefaultValueForType(item.objectTypeScriptName, property.scriptName) : cwApi.cwPropertiesGroups.getValue(item.objectTypeScriptName, property, 'properties', item);
		  if (ddlPropertyScriptName == pScriptname)
		  {   
			  optionsLoop: for (j = 0; j < ddlPropertyOptionPairs.options.length; j += 1)
			  {
		        if (ddlPropertyOptionPairs.options[j].value == value)
				{
				  lSrc = "./images/"+ddlPropertyOptionPairs.options[j].image;
				  lValue = value;	
				  //lValue = (value == 'Y') ? 'FLOWed' : (value == 'N') ? 'Not FLOWed' : 'N/A';
      			  break optionsLoop;  
				}
			  }
			  if (lValue == 'Undefined')
			  { 
				output.push('<td>', 'Not Set', '</td>');  
			  }
			  else
			  {
			    output.push('<td nowrap="yes"><img style="vertical-align:middle;" src="', lSrc ,'"/>'); 
			    output.push('<span style="margin-left: 5px; vertical-align:middle;">', lValue ,'</span></td>'); 				  
			  }	
		  }
		  else
		  {
			output.push('<td>', value, '</td>');  
		  }
        }
      }
    }

    for (assoKey in schemaNode.AssociationsTargetObjectTypes) {
      if (schemaNode.AssociationsTargetObjectTypes.hasOwnProperty(assoKey)) {
        asso = schemaNode.AssociationsTargetObjectTypes[assoKey];
        nodeSchema = cwApi.ViewSchemaManager.getNodeSchemaByIdForCurrentView(asso.nodeID);
        assoCount = 0;
        if (item.associations[assoKey]) {
          assoCount = item.associations[assoKey].length;
        }
        output.push('<td data-association-count="', assoCount, '" data-node-id="', assoKey, '">');
        layout = new cwApi.cwLayouts[asso.layoutName](nodeSchema.LayoutOptions);
        layout.drawAssociations(output, null, item);
        output.push('</td>');
      }
    }
    output.push("</tr>");
  };

  function outputTableHeaderColumn(o, property, pHtml) {
    o.push('<th class="cw-header" data-field="', property.scriptName, '">', pHtml, '</th>');
  }

  function outputNormalTableHeaderColumn(o, schemaNode, propertyScriptName) {
    var property, pHtml;
    property = cwApi.mm.getProperty(schemaNode.ObjectTypeScriptName, propertyScriptName);
    pHtml = cwApi.mm.getPropertyNameHTML(schemaNode.ObjectTypeScriptName, propertyScriptName);
    outputTableHeaderColumn(o, property, pHtml);
  }

  function outputIntersectionTableHeaderColumn(o, schemaNode, propertyScriptName) {
    var property, pHtml;
    property = cwApi.mm.getProperty(schemaNode.iObjectTypeScriptName, propertyScriptName);
    pHtml = cwApi.mm.getPropertyNameHTML(schemaNode.iObjectTypeScriptName, propertyScriptName);
    outputTableHeaderColumn(o, property, pHtml);
  }

  cwLayoutTableDDLPropertyValuesWithIcons.prototype.drawAssociations = function (output, associationTitleText, object, associationKey) {
    /*jslint unparam:true*/
    var i, child, asso, schemaNode, objectId, associationTargetNode;

    schemaNode = cwApi.ViewSchemaManager.getNodeSchemaByIdForCurrentView(this.nodeID);

    if (cwApi.isNull(object)) {
      // Is a creation page therefore a real object does not exist
      if (!cwApi.isUndefined(schemaNode.AssociationsTargetObjectTypes[this.nodeID])) {
        objectId = 0;
        associationTargetNode = schemaNode.AssociationsTargetObjectTypes[this.nodeID];
      } else {
        return;
      }
    } else {
      if (!cwApi.isUndefined(object.associations[this.nodeID])) {
        objectId = object.object_id;
        associationTargetNode = object.associations[this.nodeID];
      } else {
        return;
      }
    }

    schemaNode = cwApi.ViewSchemaManager.getNodeSchemaByIdForCurrentView(this.nodeID);
    output.push("<table class='cw-grid wg-table ", this.nodeID, " ", this.nodeID, "-", objectId, "");
    if (associationTargetNode.length > 0 || cwApi.queryObject.isEditMode()) {
      output.push(' cw-visible ');
    }
    output.push("'>");
    output.push('<thead><tr class="head-row">');

    output.push('<th class="cw-header" data-field="actions">', $.i18n.prop('grid_options'), '</th>');

    cwLayoutTableDDLPropertyValuesWithIcons.outputPropertiesGroups(output, schemaNode, null, 'PropertiesGroups', outputNormalTableHeaderColumn, schemaNode.ObjectTypeScriptName);
    cwLayoutTableDDLPropertyValuesWithIcons.outputPropertiesGroups(output, schemaNode, null, 'iPropertiesGroups', outputIntersectionTableHeaderColumn, schemaNode.ObjectTypeScriptName);

    for (asso in schemaNode.AssociationsTargetObjectTypes) {
      if (schemaNode.AssociationsTargetObjectTypes.hasOwnProperty(asso)) {
        output.push('<th class="cw-header cw-grid-association-header" data-field="', asso, '">', schemaNode.AssociationsTargetObjectTypes[asso].displayNodeName, '</th>');
      }
    }
    output.push('</tr></thead>');
    output.push('<tbody>');

    for (i = 0; i < associationTargetNode.length; i += 1) {
      child = associationTargetNode[i];
      this.drawOneMethod(output, child);
      this.gridItems[child.object_id] = child;
    }

    output.push('</tbody>');
    output.push("</table>");
  };

  cwApi.cwLayouts.cwLayoutTableDDLPropertyValuesWithIcons = cwLayoutTableDDLPropertyValuesWithIcons;

}(cwAPI, jQuery));