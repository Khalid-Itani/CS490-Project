import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { Card, Container, Section } from "../components/ui/Card";
import { Icon } from "../components/ui/Icon";

const API = import.meta?.env?.VITE_API_URL || 'http://localhost:3000';

function fmtDate(d) {
  if (!d) return null;
  const dt = new Date(d);
  return isNaN(dt.getTime()) ? null : dt.toISOString().slice(0, 10);
}

const StatCard = ({ title, count = 0, to, icon }) => (
  <Card variant="hover" size="large" className="flex flex-col gap-3 w-full">
    <div className="flex items-center gap-3">
      <div className="rounded-lg bg-gray-100 p-2">{icon}</div>
      <Card.Title className="m-0 text-base sm:text-lg">{title}</Card.Title>
    </div>
    <Card.Body>
      <p className="text-3xl font-semibold">{count}</p>
      <Card.Footer className="mt-2">
        <Link
          to={to}
          className="inline-flex items-center gap-2 rounded-md px-3 py-2 text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700"
          style={{ background: 'var(--primary-color, #4f46e5)' }}
        >
          <Icon name="plus" className="!h-4 !w-4 text-white" variant="white" />
          Quick add
        </Link>
      </Card.Footer>
    </Card.Body>
  </Card>
);

const EmptyLine = ({ text }) => <li className="text-gray-500">— {text}</li>;

export default function ProfileDashboard() {
  const [overview, setOverview] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    axios
      .get(`${API}/profile/overview?userId=1`)
      .then((res) => setOverview(res.data))
      .catch(() => setOverview({}))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <Container>
        <Section>
          <div className="h-8 w-48 animate-pulse rounded-md bg-gray-200" />
          <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-32 animate-pulse rounded-lg bg-gray-100" />
            ))}
          </div>
        </Section>
      </Container>
    );
  }

  const educList = overview?.recent?.education ?? [];
  const projList = overview?.recent?.projects ?? [];
  const summary = overview?.summary ?? {};
  const score = Math.min(100, Math.max(0, Math.round(overview?.completion?.score ?? 0)));

  return (
    <Container>
      {/* Page heading */}
      <Section className="pb-4">
        <h1 className="text-2xl font-bold tracking-tight text-gray-900">Profile Overview</h1>
        <p className="mt-1 text-sm text-gray-600">Keep your profile fresh to increase your match quality.</p>
      </Section>

      {/* Stats */}
      <Section className="pt-0">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          <StatCard
            title="Education"
            count={summary.educationCount ?? 0}
            to="/education"
            icon={<Icon name="education" size="lg" />}
          />
          <StatCard
            title="Certifications"
            count={summary.certificationCount ?? 0}
            to="/certifications"
            icon={<Icon name="certifications" size="lg" />}
          />
          <StatCard
            title="Projects"
            count={summary.projectCount ?? 0}
            to="/projects"
            icon={<Icon name="projects" size="lg" />}
          />
        </div>
      </Section>

      {/* Recent lists */}
      <Section className="pt-0">
        <div className="grid gap-6 lg:grid-cols-2">
          <Card variant="default" size="large">
            <Card.Header>
              <Card.Title>Recent Education</Card.Title>
              <Card.Description>Your latest entries</Card.Description>
            </Card.Header>
            <Card.Body>
              <ul className="space-y-2">
                {educList.length === 0 && <EmptyLine text="No education yet" />}
                {educList.map((e) => (
                  <li key={e.id} className="rounded-md border border-gray-200 p-3">
                    <div className="font-medium">{e.degree}</div>
                    <div className="text-sm text-gray-600">
                      {e.institution} · {fmtDate(e.startDate) ?? 'N/A'} — {fmtDate(e.endDate) ?? 'Ongoing'}
                    </div>
                  </li>
                ))}
              </ul>
            </Card.Body>
            <Card.Footer>
              <Link to="/education" className="text-sm font-medium text-indigo-600 hover:underline">
                Manage education
              </Link>
            </Card.Footer>
          </Card>

          <Card variant="default" size="large">
            <Card.Header>
              <Card.Title>Recent Projects</Card.Title>
              <Card.Description>What you’ve been building</Card.Description>
            </Card.Header>
            <Card.Body>
              <ul className="space-y-2">
                {projList.length === 0 && <EmptyLine text="No projects yet" />}
                {projList.map((p) => (
                  <li key={p.id} className="rounded-md border border-gray-200 p-3">
                    <div className="font-medium">{p.name}</div>
                    <div className="text-sm text-gray-600">{p.status ?? 'Status unknown'}</div>
                  </li>
                ))}
              </ul>
            </Card.Body>
            <Card.Footer>
              <Link to="/projects" className="text-sm font-medium text-indigo-600 hover:underline">
                Manage projects
              </Link>
            </Card.Footer>
          </Card>
        </div>
      </Section>

      {/* Profile strength */}
      <Section className="pt-0">
        <Card variant="default" size="large">
          <Card.Header>
            <Card.Title>Profile Strength</Card.Title>
            <Card.Description>
              Complete your profile to improve matching and ATS visibility.
            </Card.Description>
          </Card.Header>

          <Card.Body>
            <div className="space-y-2">
              <div className="relative w-full max-w-xl">
                <div className="h-3 w-full rounded-full bg-gray-100 ring-1 ring-inset" style={{ borderColor: 'var(--border-color, rgba(0,0,0,.08))' }} />
                <div
                  className="absolute inset-y-0 left-0 h-3 rounded-full transition-all"
                  style={{
                    width: `${score}%`,
                    background: 'var(--primary-color, #4f46e5)',
                  }}
                />
              </div>
              <div className="flex items-center justify-between max-w-xl text-sm">
                <span className="font-medium text-gray-900">{score}%</span>
                <span className="text-gray-500">
                  {score < 50 && 'Add more education and at least one project to boost your profile.'}
                  {score >= 50 && score < 80 && 'Great start! Add certifications and project outcomes for a stronger profile.'}
                  {score >= 80 && 'Strong profile. Keep it up by keeping entries current.'}
                </span>
              </div>
            </div>
          </Card.Body>
        </Card>
      </Section>
    </Container>
  );
}