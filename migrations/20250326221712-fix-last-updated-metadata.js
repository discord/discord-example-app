export async function up(queryInterface, Sequelize) {
  try {
    await queryInterface.addColumn('Clips', 'lastMetadataUpdate', {
      type: Sequelize.DATE,
      allowNull: true
    });
  } catch (error) {
    console.error('Migration failed:', error);
    throw error;
  }
}

export async function down(queryInterface, Sequelize) {
  try {
    await queryInterface.removeColumn('Clips', 'lastMetadataUpdate');
  } catch (error) {
    console.error('Migration rollback failed:', error);
    throw error;
  }
}