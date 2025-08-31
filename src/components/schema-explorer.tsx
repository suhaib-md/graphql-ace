import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { Skeleton } from '@/components/ui/skeleton';

interface SchemaExplorerProps {
  schema: any;
  isLoading: boolean;
}

const TypeRef = ({ type }: { type: any }) => {
  if (!type) return null;
  if (type.kind === 'LIST') {
    return <span className="text-muted-foreground">[<TypeRef type={type.ofType} />]</span>;
  }
  if (type.kind === 'NON_NULL') {
    return <><TypeRef type={type.ofType} />!</>;
  }
  return <span className="text-purple-600 dark:text-purple-400">{type.name}</span>;
};

const Field = ({ field }: { field: any }) => (
  <div className="py-2 pl-2">
    <p className="font-mono text-sm break-all">
      <span className="font-medium text-blue-700 dark:text-blue-400">{field.name}</span>
      {field.args && field.args.length > 0 && (
        <>
          <span className="text-muted-foreground">(</span>
          <div className="pl-4">
          {field.args.map((arg: any) => (
            <div key={arg.name}>
              <span className="text-orange-600 dark:text-orange-400">{arg.name}</span>: <TypeRef type={arg.type} />
            </div>
          ))}
          </div>
          <span className="text-muted-foreground">)</span>
        </>
      )}
      : <TypeRef type={field.type} />
    </p>
    {field.description && <p className="text-xs text-muted-foreground mt-1 pl-1">{field.description}</p>}
  </div>
);

const TypeDetail = ({ type }: { type: any }) => {
  if (!type) return <div className="p-4 text-sm text-muted-foreground">Could not find type details.</div>;
  return (
    <div className="pl-4 border-l">
      <p className="text-sm text-muted-foreground py-2">{type.description}</p>
      {type.fields && (
        <div className="mt-2">
          <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Fields</h4>
          {type.fields.map((field: any) => (
            <Field key={field.name} field={field} />
          ))}
        </div>
      )}
      {type.inputFields && (
        <div className="mt-2">
          <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Input Fields</h4>
          {type.inputFields.map((field: any) => (
            <Field key={field.name} field={field} />
          ))}
        </div>
      )}
      {type.enumValues && (
        <div className="mt-2">
          <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">Values</h4>
          {type.enumValues.map((val: any) => (
             <div key={val.name} className="py-2 pl-2">
                <p className="font-mono text-sm font-medium">{val.name}</p>
                {val.description && <p className="text-xs text-muted-foreground mt-1">{val.description}</p>}
             </div>
          ))}
        </div>
      )}
    </div>
  );
};


export function SchemaExplorer({ schema, isLoading }: SchemaExplorerProps) {
  if (isLoading) {
    return (
      <div className="space-y-2 p-2">
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
        <Skeleton className="h-10 w-full" />
      </div>
    );
  }

  if (!schema) {
    return <div className="text-center text-muted-foreground p-4 text-sm">No schema loaded. Select an environment and refresh.</div>;
  }
  
  const { queryType, mutationType, subscriptionType, types } = schema;

  const renderSection = (typeId: string | undefined, title: string) => {
    if (!typeId) return null;
    const type = types.find((t: any) => t.name === typeId);
    if (!type || !type.fields) return null;
    return (
      <AccordionItem value={title}>
        <AccordionTrigger className="text-base font-medium">{title}</AccordionTrigger>
        <AccordionContent>
          {type.fields.map((field: any) => (
             <Field key={field.name} field={field} />
          ))}
        </AccordionContent>
      </AccordionItem>
    );
  };
  
  const getRootType = (field: any): any => {
    let currentType = field.type;
    while (currentType.ofType) {
      currentType = currentType.ofType;
    }
    return types.find((t: any) => t.name === currentType.name);
  };

  const renderRootSection = (typeName: string | undefined, title: string) => {
    if (!typeName) return null;
    const type = types.find((t: any) => t.name === typeName);
    if (!type || !type.fields) return null;
    return (
      <AccordionItem value={title}>
        <AccordionTrigger className="text-base font-medium">{title}</AccordionTrigger>
        <AccordionContent className="pl-2">
          <Accordion type="multiple" className="w-full">
          {type.fields.map((field: any) => (
            <AccordionItem value={field.name} key={field.name}>
              <AccordionTrigger className="hover:no-underline p-0">
                <Field field={field} />
              </AccordionTrigger>
              <AccordionContent>
                  <TypeDetail type={getRootType(field)} />
              </AccordionContent>
            </AccordionItem>
          ))}
          </Accordion>
        </AccordionContent>
      </AccordionItem>
    );
  };

  return (
    <Accordion type="multiple" className="w-full">
      {renderRootSection(queryType?.name, 'Queries')}
      {renderRootSection(mutationType?.name, 'Mutations')}
      {renderRootSection(subscriptionType?.name, 'Subscriptions')}
    </Accordion>
  );
}
