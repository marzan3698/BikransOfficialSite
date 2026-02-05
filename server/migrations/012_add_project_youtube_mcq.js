export async function up(conn) {
    await conn.query(`
    ALTER TABLE projects
    ADD COLUMN youtube_url VARCHAR(500) DEFAULT NULL,
    ADD COLUMN mcq1_question VARCHAR(500) DEFAULT NULL,
    ADD COLUMN mcq1_option_a VARCHAR(255) DEFAULT NULL,
    ADD COLUMN mcq1_option_b VARCHAR(255) DEFAULT NULL,
    ADD COLUMN mcq1_option_c VARCHAR(255) DEFAULT NULL,
    ADD COLUMN mcq1_option_d VARCHAR(255) DEFAULT NULL,
    ADD COLUMN mcq1_answer CHAR(1) DEFAULT NULL,
    ADD COLUMN mcq2_question VARCHAR(500) DEFAULT NULL,
    ADD COLUMN mcq2_option_a VARCHAR(255) DEFAULT NULL,
    ADD COLUMN mcq2_option_b VARCHAR(255) DEFAULT NULL,
    ADD COLUMN mcq2_option_c VARCHAR(255) DEFAULT NULL,
    ADD COLUMN mcq2_option_d VARCHAR(255) DEFAULT NULL,
    ADD COLUMN mcq2_answer CHAR(1) DEFAULT NULL,
    ADD COLUMN mcq3_question VARCHAR(500) DEFAULT NULL,
    ADD COLUMN mcq3_option_a VARCHAR(255) DEFAULT NULL,
    ADD COLUMN mcq3_option_b VARCHAR(255) DEFAULT NULL,
    ADD COLUMN mcq3_option_c VARCHAR(255) DEFAULT NULL,
    ADD COLUMN mcq3_option_d VARCHAR(255) DEFAULT NULL,
    ADD COLUMN mcq3_answer CHAR(1) DEFAULT NULL
  `)
}

export async function down(conn) {
    await conn.query(`
    ALTER TABLE projects
    DROP COLUMN youtube_url,
    DROP COLUMN mcq1_question,
    DROP COLUMN mcq1_option_a,
    DROP COLUMN mcq1_option_b,
    DROP COLUMN mcq1_option_c,
    DROP COLUMN mcq1_option_d,
    DROP COLUMN mcq1_answer,
    DROP COLUMN mcq2_question,
    DROP COLUMN mcq2_option_a,
    DROP COLUMN mcq2_option_b,
    DROP COLUMN mcq2_option_c,
    DROP COLUMN mcq2_option_d,
    DROP COLUMN mcq2_answer,
    DROP COLUMN mcq3_question,
    DROP COLUMN mcq3_option_a,
    DROP COLUMN mcq3_option_b,
    DROP COLUMN mcq3_option_c,
    DROP COLUMN mcq3_option_d,
    DROP COLUMN mcq3_answer
  `)
}
