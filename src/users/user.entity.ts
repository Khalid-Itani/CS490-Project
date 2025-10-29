import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, BeforeInsert, BeforeUpdate, OneToOne } from 'typeorm';
import { Profile } from './profile.entity';

@Entity('users')
export class User {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ unique: true })
  email: string;

  @Column()
  password: string;

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;

  // for UC-009 later
  // Use DB-agnostic Date columns (no explicit 'timestamp') so SQLite and Postgres
  // both accept them. TypeORM will pick the appropriate type per driver.
  // Explicitly set a DB type supported by SQLite. We use 'datetime' which
  // TypeORM maps appropriately for sqlite; for Postgres this will still work
  // but you can adjust to 'timestamp' in production if desired.
  @Column({ name: 'deletion_requested_at', type: 'timestamp', nullable: true })
  deletionRequestedAt: Date | null;

  @Column({ name: 'deletion_grace_until', type: 'timestamp', nullable: true })
  deletionGraceUntil: Date | null;

  @Column({ name: 'deleted_at', type: 'timestamp', nullable: true })
  deletedAt: Date | null;

  @Column({ name: 'is_pending_deletion', type: 'boolean', default: false })
  isPendingDeletion: boolean;

  @Column({ name: 'deletion_reason', type: 'text', nullable: true })
  deletionReason: string | null;

  @Column({ name: 'deletion_cancel_token', type: 'varchar', nullable: true })
  deletionCancelToken: string | null;

  @BeforeInsert()
  @BeforeUpdate()
  lowercaseEmail() {
    if (this.email) this.email = this.email.toLowerCase();
  }

  @OneToOne(() => Profile, (profile) => profile.user, { cascade: true, nullable: true })
  profile?: Profile | null;
}
