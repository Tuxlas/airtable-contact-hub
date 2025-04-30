
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
  Cargo?: string;
  Email?: string;
  Telefono?: string;
  Empresa?: string[];
  Sede?: string[];
  Sector?: string[];
  Direccion?: string;
  Ciudad?: string;
  Pais?: string;
  Fuente?: string;
  "Tarjeta Escaneada"?: string[];
  Web?: string;
  "Fecha de Creacion"?: string;
};

export type CompanyRecord = {
  Nombre?: string;
  Sector?: string[];
  Web?: string;
  Tags?: string[];
  "Numero de Sedes"?: number;
  "Numero de Contactos"?: number;
  "Contactos Relacionados"?: string[];
};

export type SedeRecord = {
  Ciudad?: string;
  Pais?: string;
  Direccion?: string;
  Empresa?: string[];
  "Contactos Relacionados"?: string[];
};

export type SectorRecord = {
  Nombre?: string;
  "Empresas Relacionadas"?: string[];
  "Contactos Relacionados"?: string[];
};

export const airtableService = {
  async fetchRecords<T>(tableName: string): Promise<AirtableRecord<T>[]> {
    try {
      const response = await fetch(`${AIRTABLE_API_URL}/${tableName}`, {
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        throw new Error(`Error fetching ${tableName}: ${response.statusText}`);
      }

      const data = await response.json();
      return data.records;
    } catch (error) {
      console.error(`Error fetching ${tableName}:`, error);
      toast({
        title: "Error",
        description: `No se pudieron cargar los datos de ${tableName}`,
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

      if (!response.ok) {
        throw new Error(`Error fetching record: ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Error fetching record from ${tableName}:`, error);
      toast({
        title: "Error",
        description: `No se pudo cargar el registro de ${tableName}`,
        variant: "destructive",
      });
      return null;
    }
  },

  async createRecord<T>(tableName: string, fields: T): Promise<AirtableRecord<T> | null> {
    try {
      const response = await fetch(`${AIRTABLE_API_URL}/${tableName}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fields }),
      });

      if (!response.ok) {
        throw new Error(`Error creating record: ${response.statusText}`);
      }

      const data = await response.json();
      toast({
        title: "Éxito",
        description: `Registro creado correctamente en ${tableName}`,
      });
      return data;
    } catch (error) {
      console.error(`Error creating record in ${tableName}:`, error);
      toast({
        title: "Error",
        description: `No se pudo crear el registro en ${tableName}`,
        variant: "destructive",
      });
      return null;
    }
  },

  async updateRecord<T>(tableName: string, recordId: string, fields: Partial<T>): Promise<AirtableRecord<T> | null> {
    try {
      const response = await fetch(`${AIRTABLE_API_URL}/${tableName}/${recordId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fields }),
      });

      if (!response.ok) {
        throw new Error(`Error updating record: ${response.statusText}`);
      }

      const data = await response.json();
      toast({
        title: "Éxito",
        description: `Registro actualizado correctamente en ${tableName}`,
      });
      return data;
    } catch (error) {
      console.error(`Error updating record in ${tableName}:`, error);
      toast({
        title: "Error",
        description: `No se pudo actualizar el registro en ${tableName}`,
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

      if (!response.ok) {
        throw new Error(`Error deleting record: ${response.statusText}`);
      }

      toast({
        title: "Éxito",
        description: `Registro eliminado correctamente de ${tableName}`,
      });
      return true;
    } catch (error) {
      console.error(`Error deleting record from ${tableName}:`, error);
      toast({
        title: "Error",
        description: `No se pudo eliminar el registro de ${tableName}`,
        variant: "destructive",
      });
      return false;
    }
  },

  async uploadImage(base64Image: string): Promise<string | null> {
    try {
      // In a real implementation, you would upload the image to Airtable
      // For now, we'll just return the base64 string
      return base64Image;
    } catch (error) {
      console.error("Error uploading image:", error);
      toast({
        title: "Error",
        description: "No se pudo subir la imagen",
        variant: "destructive",
      });
      return null;
    }
  },
};
