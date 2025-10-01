"use server"

export async function fetchEmailOctopusContacts() {
  const apiKey = process.env.EMAILOCTOPUS_API_KEY
  const listId = process.env.EMAILOCTOPUS_LIST_ID

  if (!apiKey || !listId) {
    throw new Error("EmailOctopus API credentials not configured")
  }

  try {
    let allContacts = []
    let startingAfter = null
    let hasMore = true

    while (hasMore) {
      const url = new URL(`https://api.emailoctopus.com/lists/${listId}/contacts`)
      url.searchParams.append("limit", "100")
      url.searchParams.append("status", "subscribed")
      if (startingAfter) {
        url.searchParams.append("starting_after", startingAfter)
      }

      const response = await fetch(url.toString(), {
        headers: {
          Authorization: `Bearer ${apiKey}`,
        },
        cache: "no-store",
      })

      if (!response.ok) {
        throw new Error(`Error fetching contacts: ${response.statusText}`)
      }

      const data = await response.json()
      allContacts = [...allContacts, ...data.data]

      // Check if there's a next page
      if (data.paging?.next?.starting_after) {
        startingAfter = data.paging.next.starting_after
      } else {
        hasMore = false
      }
    }

    return { success: true, contacts: allContacts }
  } catch (error) {
    return { success: false, error: error.message }
  }
}
