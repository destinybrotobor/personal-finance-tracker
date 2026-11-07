import Header from "@/components/custom/Header";

const About = () => {
  return (
    <div className="min-h-screen">
      <Header />

      {/* Page Title */}
      <div className="container mx-auto w-full bg-corporate-blue pt-20 pb-6 flex min-h-16 items-center justify-between px-4">
        <h1 className="text-3xl font-bold text-white py-2 px-5">
          About Project
        </h1>
      </div>

      {/* About Page Content */}
      <div className="container mx-auto px-4 py-10 space-y-12">
        {/* Project Overview */}
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-corporate-blue">
            Project Overview
          </h2>
          <p className="text-gray-700 leading-relaxed mb-6">
            The Personal Finance Tracker is a responsive web application designed
            to help individuals manage their finances more effectively. It
            provides tools for tracking income and expenses, setting budgets,
            and receiving real-time alerts when spending thresholds are
            approached or exceeded. With intuitive charts and visual analytics,
            users can better understand their financial habits and make informed
            decisions to achieve long-term financial stability.
          </p>
          <blockquote className="border-l-4 border-corporate-blue pl-4 italic text-gray-600">
            “Stay on top of your money without the worry! Receive real-time
            updates on your spending, create budgets that work for your
            lifestyle, and get friendly notifications before you over-spend—
            making saving and achieving your goals easier.”
          </blockquote>
        </section>

        {/* Student Information */}
        <section>
          <h2 className="text-2xl font-semibold mb-4 text-corporate-blue">
            Student Information
          </h2>
          <div className="bg-gray-50 border rounded-md p-6 text-gray-700 space-y-2">
            <p>
              <span className="font-semibold">Name:</span> Ibeh Doris Chidimma
            </p>
            <p>
              <span className="font-semibold">University:</span> Chukwuemeka Odumegwu Ojukwu University, Uli, Anambra State, Nigeria
            </p>
            <p>
              <span className="font-semibold">Student ID:</span> 2025223001
            </p>
            <p>
              <span className="font-semibold">Program:</span> Computer Science, PGD
            </p>
          </div>
        </section>
      </div>
    </div>
  );
};

export default About;
