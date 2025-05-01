
import { toast } from "@/hooks/use-toast";

const AIRTABLE_API_KEY = "pat9tJ0oxUIgtnzoq.fd104ea0b4866aa88fc66f2ab2c10d7ecf9507b1662873bff43c991978b733f6";
const AIRTABLE_BASE_ID = "appVbaOLrHQGOQlgC";
const AIRTABLE_API_URL = `https://api.airtable.com/v0/${AIRTABLE_BASE_ID}`;

export type AirtableRecord<T> = {
  id: string;
  fields: T;
  createdTime: string;
};

// Updated field names to match exactly what's in Airtable
export type ContactRecord = {
  Nombre?: string;
  Cargo?: string;
  Email?: string;
  Teléfono?: string; // Fixed field name from "Telefono" to "Teléfono" with accent
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
      console.log(`Fetching records from ${tableName}...`);
      const response = await fetch(`${AIRTABLE_API_URL}/${tableName}`, {
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error fetching ${tableName}: ${response.status} ${response.statusText}`, errorText);
        throw new Error(`Error fetching ${tableName}: ${response.statusText} (${response.status})`);
      }

      const data = await response.json();
      console.log(`Successfully fetched ${data.records.length} records from ${tableName}`);
      
      // Log first record field names for debugging
      if (data.records && data.records.length > 0) {
        console.log(`First record fields: ${JSON.stringify(Object.keys(data.records[0].fields))}`);
      }
      
      return data.records;
    } catch (error) {
      console.error(`Error fetching ${tableName}:`, error);
      toast({
        title: "Error de conexión",
        description: `No se pudieron cargar los datos de ${tableName}. Verifica la conexión con Airtable.`,
        variant: "destructive",
      });
      return [];
    }
  },

  async fetchRecord<T>(tableName: string, recordId: string): Promise<AirtableRecord<T> | null> {
    try {
      console.log(`Fetching record ${recordId} from ${tableName}...`);
      const response = await fetch(`${AIRTABLE_API_URL}/${tableName}/${recordId}`, {
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error fetching record from ${tableName}: ${response.status} ${response.statusText}`, errorText);
        throw new Error(`Error fetching record: ${response.statusText} (${response.status})`);
      }

      const data = await response.json();
      console.log(`Successfully fetched record ${recordId} from ${tableName}`);
      
      // Log record field names for debugging
      if (data && data.fields) {
        console.log(`Record fields: ${JSON.stringify(Object.keys(data.fields))}`);
      }
      
      return data;
    } catch (error) {
      console.error(`Error fetching record from ${tableName}:`, error);
      toast({
        title: "Error",
        description: `No se pudo cargar el registro de ${tableName}. Verifica la conexión con Airtable.`,
        variant: "destructive",
      });
      return null;
    }
  },

  async createRecord<T>(tableName: string, fields: T): Promise<AirtableRecord<T> | null> {
    try {
      console.log(`Creating record in ${tableName}...`, fields);
      const response = await fetch(`${AIRTABLE_API_URL}/${tableName}`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fields }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error creating record in ${tableName}: ${response.status} ${response.statusText}`, errorText);
        throw new Error(`Error creating record: ${response.statusText} (${response.status})`);
      }

      const data = await response.json();
      console.log(`Successfully created record in ${tableName}`);
      toast({
        title: "Éxito",
        description: `Registro creado correctamente en ${tableName}`,
      });
      return data;
    } catch (error) {
      console.error(`Error creating record in ${tableName}:`, error);
      toast({
        title: "Error",
        description: `No se pudo crear el registro en ${tableName}. Verifica la conexión con Airtable.`,
        variant: "destructive",
      });
      return null;
    }
  },

  async updateRecord<T>(tableName: string, recordId: string, fields: Partial<T>): Promise<AirtableRecord<T> | null> {
    try {
      console.log(`Updating record ${recordId} in ${tableName}...`, fields);
      
      // Fix common field name errors - this helps with the Telefono/Teléfono issue
      if (tableName === "Contactos" && 'Telefono' in fields && !('Teléfono' in fields)) {
        console.log("Converting 'Telefono' field to 'Teléfono'");
        const updatedFields = { ...fields } as any;
        updatedFields['Teléfono'] = updatedFields['Telefono'];
        delete updatedFields['Telefono'];
        fields = updatedFields;
      }
      
      const response = await fetch(`${AIRTABLE_API_URL}/${tableName}/${recordId}`, {
        method: "PATCH",
        headers: {
          Authorization: `Bearer ${AIRTABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ fields }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`Error updating record in ${tableName}: ${response.status} ${response.statusText}`, errorText);
        
        // Provide more specific error message for field name issues
        if (response.status === 422 && errorText.includes("Unknown field name")) {
          const fieldMatch = errorText.match(/Unknown field name: "([^"]+)"/);
          const fieldName = fieldMatch ? fieldMatch[1] : "unknown";
          toast({
            title: "Error de campo",
            description: `El campo "${fieldName}" no existe en Airtable. Verifica el nombre exacto del campo en Airtable.`,
            variant: "destructive",
          });
        }
        
        throw new Error(`Error updating record: ${response.statusText} (${response.status})`);
      }

      const data = await response.json();
      console.log(`Successfully updated record ${recordId} in ${tableName}`);
      toast({
        title: "Éxito",
        description: `Registro actualizado correctamente en ${tableName}`,
      });
      return data;
    } catch (error) {
      console.error(`Error updating record in ${tableName}:`, error);
      toast({
        title: "Error",
        description: `No se pudo actualizar el registro en ${tableName}. Verifica la conexión con Airtable.`,
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
