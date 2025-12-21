# Biomarker Graph API

This is a RESTful API built with NestJS that provides access to biomarker data stored in a Neo4j graph database. The API allows users to query and retrieve information about various biomarkers, their relationships, and associated data.

## Requirements

- Docker (for containerization)

For local development:

- Node.js (version 20 or higher)

## Installation (Docker)

1. Install the dependencies:

    ```bash
    npm install
    ```

2. Set up environment variables:  
    Create a `.env` file in the root directory and add the `DATABASE_URL` variable. You can refer to the `.env.example` file for guidance.

3. Start the app:

    ```bash
    docker-compose up -d
    ```

## Installation (Local Development)

1. Install the dependencies:

    ```bash
    npm install
    ```

2. Set up environment variables:  
    Create a `.env` file in the root directory and add the `DATABASE_URL` variable. You can refer to the `.env.example` file for guidance.

3. Start the database:

    ```bash
    docker-compose up -d db
    ```

4. Initialize the database:

    ```bash
    npm run prisma:bootstrap
    ```

5. Start the application:

    ```bash
    npm run start
    ```

The API will be accessible at `http://localhost:3000`.

## API Examples

The snippets are documented in the Swagger UI, accessible at `http://localhost:3000/api`.

## Testing

To run the tests, use the following command:

```bash
npm run test
```

And for e2e tests:

```bash
npm run test:e2e
```

## Design Notes

### Framework Choice

I chose NestJS because I habe a bit of experience with it and I think it fits well for building scalable and maintainable API. Plus, I like it.

### API Style

The API follows RESTful principles, because I never touched GraphQL. and uses standard HTTP methods (GET, POST, PUT, DELETE) for CRUD operations.

### ORM Choice

I choose Prisma because I'm familiar with it and it has good support for TypeScript and NestJS.

### Data model rationale

I did the model I think fits best the requirements.

I added a `AnalyteAllowedUnit` entity to handle the many-to-many relationship between `Analyte` and `Unit`, allowing each analyte to have multiple allowed units and be strict about it.

I put the trends as an enum (`Trend`) to limit the possible values and make it easier to handle in the code.

The `analyteAllowedUnitId` in `Observation` ensures that each observation uses a valid unit for the given analyte. That unit can be different from the default unit of the analyte, allowing flexibility while maintaining data integrity.

### Conversion approach

I used glucose, hemoglobin and creatinine (urine and blood) as examples.  
I searched the common units for these analytes and implemented conversion functions between them.
<https://heartcare.sydney/glucose-unit-conversion/#:~:text=Glucose%20levels%20are%20commonly%20measured,dL%20(milligrams%20per%20deciliter).>
<https://www.mayoclinic.org/tests-procedures/creatinine-test/about/pac-20384646#:~:text=Serum%20creatinine%20is%20reported%20as,to%20119.3%20%C2%B5mol%2FL).>
<https://www.gastro.medline.ch/Services_et_outils/Conversions_et_calculs/Conversion_de_mg_dl_en_mol_l.php>

### Known limitations

- The API does not implement authentication or authorization mechanisms.
- Error handling is basic and could be improved for better user experience.
- The data model may need to be expanded to accommodate additional biomarker types and relationships in the future.
- The `Unit` and `Analyte` inputs are in both forms (id and name/code), which was to make testing easier, but should be normalized.
- The conversion functions are hardcoded and only cover a few analytes and units. A more scalable approach would be needed for a production system.

### Next steps

- Implement authentication and authorization.
- Improve error handling and validation.
- Normalize input data for `Unit` and `Analyte`.

## Questions

<https://github.com/NicolasFrouin/biomarker_graph_api/issues/1>

## ADRs

I did not know about ADRs before so I tried but I'm not sure I did it right.

They are in the `adr` folder.

## Time spent

Around 15 hours.

I came back to coding after a break and had to relearn a few things, it was fun.
