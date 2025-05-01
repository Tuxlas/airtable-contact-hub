import { toast } from "@/hooks/use-toast";

const AIRTABLE_API_KEY = "pat9tJ0oxUIgtnzoq.fd104ea0b4866aa88fc66f2ab2c10d7ecf9507b1662873bff43c991978b733f6";
const AIRTABLE_BASE_ID = "appVbaOLrHQGOQlgC";
const AIRTABLE_API_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}`;

export type AirtableRecord<T> = {
  id: string;
  fields: T;
  createdTime: string;
};

export type ContactRecord = {
  Nombre?: string;
  Apellidos?: string;
  Cargo?: string;
  Email?: string;
  Teléfono?: string;
  Empresa?: string[];
  Sede?: string[];
  Sector?: string[];
  Dirección?: string;
  Ciudad?: string;
  País?: string;
  Fuente?: string;
  "Tarjeta Escaneada"?: string[];
  Web?: string;
  "Fecha de Creación"?: string;
  WebEmpresa?: string;
  SectorName?: string;
};

export type CompanyRecord = {
  NombreEmpresa?: string;
  Sector?: string[];
  WebEmpresa?: string;
  Sedes?: string[];
  NumeroSedes?: number;
  Tags?: string[];
  NumeroContactos?: number;
  Contactos?: string[];
  "Fecha de Creación"?: string;
};

export type SedeRecord = {
  Ciudad?: string;
  Empresa?: string[];
  País?: string;
  Dirección?: string;
  TotalContactos?: number;
  Contactos?: string[];
};

export type SectorRecord = {
  NombreSector?: string;
  Empresas?: string[];
  NumeroEmpresas?: number;
  Contactos?: string[];
};

// FUNCION UTIL para corregir campos (Teléfono, País, etc.)
function fixFieldNames(tableName: string, fields: any): any {
  const updatedFields = { ...fields };

  if (tableName === "Contactos") {
    if ('Telefono' in updatedFields && !('Teléfono' in updatedFields)) {
      updatedFields['Teléfono'] = updatedFields['Telefono'];
      delete updatedFields['Telefono'];
    }
    if ('Direccion' in updatedFields && !('Dirección' in updatedFields)) {
      updatedFields['Dirección'] = updatedFields['Direccion'];
      delete updatedFields['Direccion'];
    }
    if ('Pais' in updatedFields && !('País' in updatedFields)) {
      updatedFields['País'] = updatedFields['Pais'];
      delete updatedFields['Pais'];
    }
  }

  if (tableName === "Sedes") {
    if ('Direccion' in updatedFields && !('Dirección' in updatedFields)) {
      updatedFields['Dirección'] = updatedFields['Direccion'];
      delete updatedFields['Direccion'];
    }
    if ('Pais' in updatedFields && !('País' in updatedFields)) {
      updatedFields['País'] = updatedFields['Pais'];
      delete updatedFields['Pais'];
    }
  }

  if (tableName === "Empresas") {
    if ('Nombre' in updatedFields && !('NombreEmpresa' in updatedFields)) {
      updatedFields['NombreEmpresa'] = updatedFields['Nombre'];
      delete updatedFields['Nombre'];
    }
    if ('Numero de Sedes' in updatedFields && !('NumeroSedes' in updatedFields)) {
      updatedFields['NumeroSedes'] = updatedFields['Numero de Sedes'];
      delete updatedFields['Numero de Sedes'];
    }
    if ('Numero de Contactos' in updatedFields && !('NumeroContactos' in updatedFields)) {
      updatedFields['NumeroContactos'] = updatedFields['Numero de Contactos'];
      delete updatedFields['Numero de Contactos'];
    }
  }

  if (tableName === "Sectores") {
    if ('Nombre' in updatedFields && !('NombreSector' in updatedFields)) {
      updatedFields['NombreSector'] = updatedFields['Nombre'];
      delete updatedFields['Nombre'];
    }
    if ('Numero de Empresas' in updatedFields && !('NumeroEmpresas' in updatedFields)) {
      updatedFields['NumeroEmpresas'] = updatedFields['Numero de Empresas'];
      delete updatedFields['Numero de Empresas'];
    }
  }

  return updatedFields;
}

export const airtableService = {
  async fetchRecords<T>(tableName: string): Promise<AirtableRecord<T>[]> {
    try {
      const response = await fetch(`${AIRTABLE_API_URL}/${tableName}`, {
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error(`Error fetching ${tableName}`);

      const data = await response.json();
      return data.records;
    } catch (error) {
      toast({
        title: "Error de conexión",
        description: `No se pudieron cargar los datos de ${tableName}.`,
        variant: "destructive",
      });
      return [];
    }
  },

  async fetchRecord<T>(tableName: string, recordId: string): Promise<AirtableRecord<T> | null> {
    try {
      const response = await fetch(`${AIRTABLE_API_URL}/${tableName}/${recordId}`, {
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error(`Error fetching record`);

      const data = await response.json();
      return data;
    } catch (error) {
      toast({
        title: "Error",
        description: `No se pudo cargar el registro de ${tableName}.`,
        variant: "destructive",
      });
      return null;
    }
  },

  async createRecord<T>(tableName: string, fields: T): Promise<AirtableRecord<T> | null> {
    try {
      const fixedFields = fixFieldNames(tableName, fields);

      const response = await fetch(`${AIRTABLE_API_URL}/${tableName}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fields: fixedFields }),
      });

      if (!response.ok) throw new Error(`Error creating record`);

      const data = await response.json();
      toast({ title: "Éxito", description: `Registro creado en ${tableName}` });
      return data;
    } catch (error) {
      toast({
        title: "Error",
        description: `No se pudo crear el registro en ${tableName}.`,
        variant: "destructive",
      });
      return null;
    }
  },

  async updateRecord<T>(tableName: string, recordId: string, fields: Partial<T>): Promise<AirtableRecord<T> | null> {
    try {
      const fixedFields = fixFieldNames(tableName, fields);

      const response = await fetch(`${AIRTABLE_API_URL}/${tableName}/${recordId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fields: fixedFields }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        if (response.status === 422 && errorText.includes("Unknown field name")) {
          const fieldMatch = errorText.match(/Unknown field name: "([^"]+)"/);
          const fieldName = fieldMatch ? fieldMatch[1] : "unknown";
          toast({
            title: "Error de campo",
            description: `El campo "${fieldName}" no existe en Airtable.`,
            variant: "destructive",
          });
        }
        throw new Error(`Error updating record`);
      }

      const data = await response.json();
      toast({ title: "Éxito", description: `Registro actualizado en ${tableName}` });
      return data;
    } catch (error) {
      toast({
        title: "Error",
        description: `No se pudo actualizar el registro en ${tableName}.`,
        variant: "destructive",
      });
      return null;
    }
  },

  async deleteRecord(tableName: string, recordId: string): Promise<boolean> {
    try {
      const response = await fetch(`${AIRTABLE_API_URL}/${tableName}/${recordId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) throw new Error(`Error deleting record`);

      toast({ title: "Éxito", description: `Registro eliminado de ${tableName}` });
      return true;
    } catch (error) {
      toast({
        title: "Error",
        description: `No se pudo eliminar el registro de ${tableName}.`,
        variant: "destructive",
      });
      return false;
    }
  },

  async uploadImage(base64Image: string): Promise<string | null> {
    try {
      return base64Image;
    } catch (error) {
      toast({
        title: "Error",
        description: "No se pudo subir la imagen",
        variant: "destructive",
      });
      return null;
    }
  },
};

