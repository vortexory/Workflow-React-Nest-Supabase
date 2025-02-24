import { MigrationInterface, QueryRunner } from "typeorm";

export class CreateInitialTables1708431600000 implements MigrationInterface {
    name = 'CreateInitialTables1708431600000'

    public async up(queryRunner: QueryRunner): Promise<void> {
        // Create workflows table
        await queryRunner.query(`
            CREATE TABLE "workflows" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "name" character varying NOT NULL,
                "nodes" jsonb NOT NULL DEFAULT '[]',
                "edges" jsonb NOT NULL DEFAULT '[]',
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "pk_workflows" PRIMARY KEY ("id")
            )
        `);

        // Create workflow_executions table
        await queryRunner.query(`
            CREATE TABLE "workflow_executions" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "workflow_id" uuid NOT NULL,
                "status" character varying NOT NULL,
                "node_results" jsonb NOT NULL DEFAULT '{}',
                "start_time" TIMESTAMP NOT NULL DEFAULT now(),
                "end_time" TIMESTAMP,
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "pk_workflow_executions" PRIMARY KEY ("id"),
                CONSTRAINT "fk_workflow_executions_workflow" FOREIGN KEY ("workflow_id") 
                    REFERENCES "workflows" ("id") ON DELETE CASCADE
            )
        `);

        // Create node_types table (optional, if you want to store node types in DB)
        await queryRunner.query(`
            CREATE TABLE "node_types" (
                "id" uuid NOT NULL DEFAULT uuid_generate_v4(),
                "type" character varying NOT NULL,
                "display_name" character varying NOT NULL,
                "description" text,
                "icon" character varying,
                "color" character varying,
                "inputs" jsonb NOT NULL DEFAULT '[]',
                "outputs" jsonb NOT NULL DEFAULT '[]',
                "properties" jsonb NOT NULL DEFAULT '[]',
                "created_at" TIMESTAMP NOT NULL DEFAULT now(),
                "updated_at" TIMESTAMP NOT NULL DEFAULT now(),
                CONSTRAINT "pk_node_types" PRIMARY KEY ("id"),
                CONSTRAINT "uq_node_types_type" UNIQUE ("type")
            )
        `);

        // Create indexes
        await queryRunner.query(`
            CREATE INDEX "idx_workflows_name" ON "workflows" ("name");
            CREATE INDEX "idx_workflow_executions_workflow_id" ON "workflow_executions" ("workflow_id");
            CREATE INDEX "idx_workflow_executions_status" ON "workflow_executions" ("status");
            CREATE INDEX "idx_node_types_type" ON "node_types" ("type");
        `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        // Drop indexes
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_node_types_type"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_workflow_executions_status"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_workflow_executions_workflow_id"`);
        await queryRunner.query(`DROP INDEX IF EXISTS "idx_workflows_name"`);

        // Drop tables
        await queryRunner.query(`DROP TABLE IF EXISTS "node_types"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "workflow_executions"`);
        await queryRunner.query(`DROP TABLE IF EXISTS "workflows"`);
    }
}
