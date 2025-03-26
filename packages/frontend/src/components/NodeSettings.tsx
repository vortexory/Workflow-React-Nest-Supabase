import { useCallback } from 'react';
import { Node } from 'reactflow';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { Button } from './ui/button';
import { Form, FormField, FormItem, FormLabel, FormControl } from './ui/form';
import { Input } from './ui/input';
import { INodeType, INodeProperty } from '@workflow-automation/common';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Switch } from './ui/switch';
import { Textarea } from './ui/textarea';

interface NodeData extends INodeType {
  settings?: Record<string, any>;
}

interface NodeSettingsProps {
  node: Node<NodeData>;
  open: boolean;
  onClose: () => void;
  onChange: (nodeId: string, settings: Record<string, any>) => void;
}

export function NodeSettings({ node, open, onClose, onChange }: NodeSettingsProps) {
  const generateSchema = useCallback((properties: INodeProperty[]) => {
    const schemaFields: Record<string, any> = {};
    
    properties.forEach((property) => {
      let fieldSchema: z.ZodType<any>;

      switch (property.type) {
        case 'string':
          fieldSchema = z.string();
          break;
        case 'number':
          fieldSchema = z.number();
          break;
        case 'boolean':
          fieldSchema = z.boolean();
          break;
        case 'select':
          fieldSchema = z.string();
          break;
        case 'multiSelect':
          fieldSchema = z.array(z.string());
          break;
        case 'json':
          fieldSchema = z.any();
          break;
        case 'code':
          fieldSchema = z.string();
          break;
        case 'filter':
          fieldSchema = z.record(z.string(), z.any());
          break;
        default:
          fieldSchema = z.any();
      }

      if (property.required) {
        schemaFields[property.name] = fieldSchema;
      } else {
        schemaFields[property.name] = fieldSchema.optional();
      }

      if (property.default !== undefined) {
        schemaFields[property.name] = schemaFields[property.name].default(property.default);
      }
    });

    return z.object(schemaFields);
  }, []);

  const properties = node?.data?.properties || [];
  const schema = generateSchema(properties);
  
  const form = useForm({
    resolver: zodResolver(schema),
    defaultValues: properties.reduce((acc, prop) => {
      if (node.data.settings?.[prop.name] !== undefined) {
        acc[prop.name] = node.data.settings[prop.name];
      } else if (prop.default !== undefined) {
        acc[prop.name] = prop.default;
      }
      return acc;
    }, {} as Record<string, any>),
  });

  const onSubmit = (data: Record<string, any>) => {
    onChange(node.id, data);
    console.log(data, "aaaaaaaaaaaaaa")
    onClose();
  };

  const renderFormControl = (property: INodeProperty, field: any) => {
    switch (property.type) {
      case 'boolean':
        return (
          <Switch
            checked={field.value}
            onCheckedChange={field.onChange}
          />
        );
      case 'select':
        return (
          <Select
            value={field.value?.toString()}
            onValueChange={field.onChange}
          >
            <SelectTrigger>
              <SelectValue placeholder={property.placeholder || `Select ${property.name}`} />
            </SelectTrigger>
            <SelectContent>
              {property.options?.map((option) => (
                <SelectItem key={option.value.toString()} value={option.value.toString()}>
                  {option.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        );
      case 'json':
      case 'code':
        return (
          <Textarea
            {...field}
            placeholder={property.placeholder}
            className="font-mono"
          />
        );
      default:
        return (
          <Input
            {...field}
            type={property.type === 'number' ? 'number' : 'text'}
            placeholder={property.placeholder}
            defaultValue={property.default}
          />
        );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{node.data.displayName} Settings</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            {properties.map((property) => (
              <FormField
                key={property.name}
                control={form.control}
                name={property.name}
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>{property.name}</FormLabel>
                    <FormControl>
                      {renderFormControl(property, field)}
                    </FormControl>
                  </FormItem>
                )}
              />
            ))}
            <div className="flex justify-end gap-2">
              <Button type="button" variant="outline" onClick={onClose}>
                Cancel
              </Button>
              <Button type="submit">Save</Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
